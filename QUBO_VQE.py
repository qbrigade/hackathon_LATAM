import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp
from qiskit.primitives import StatevectorEstimator as Estimator, Sampler
from qiskit.circuit.library import EfficientSU2, RealAmplitudes, TwoLocal
from qiskit_ibm_runtime import SamplerV2, EstimatorV2
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer.primitives import Estimator as AerEstimator
from nftopt import nakanishi_fujii_todo


class VQESolver:
    """
    A general-purpose Variational Quantum Eigensolver (VQE) implementation.
    
    This class solves the eigenvalue problem for a given Hamiltonian using
    variational quantum algorithms with customizable ansatzes and optimizers.
    """
    
    def __init__(self, hamiltonian=None, num_qubits=None):
        """
        Initialize the VQE solver.
        
        Args:
            hamiltonian: SparsePauliOp representing the Hamiltonian (optional)
            num_qubits: Number of qubits (optional, inferred from Hamiltonian if provided)
        """
        self._hamiltonian = hamiltonian
        self._num_qubits = num_qubits
        
        if hamiltonian is not None and num_qubits is None:
            self._num_qubits = hamiltonian.num_qubits
        
        self._ansatz = None
        self._estimator = Estimator()
        self._sampler = Sampler()
        
        # For IBM runtime support
        self._ansatz_isa = None
        self._hamiltonian_isa = None
        
        # Optimization tracking
        self._callback_dict = {
            "iters": -1,
            "cost_history": [],
        }
        self._callback_step_size = 0
        self._last_parameters = None
        self._last_sampler_stats = None
        
    # Properties
    @property
    def hamiltonian(self):
        return self._hamiltonian
    
    @property
    def num_qubits(self):
        return self._num_qubits
    
    @property
    def ansatz(self):
        return self._ansatz
    
    @property
    def estimator(self):
        return self._estimator
    
    @property
    def sampler(self):
        return self._sampler
    
    @property
    def callback_dict(self):
        return self._callback_dict
    
    @property
    def last_parameters(self):
        return self._last_parameters
    
    # Setters
    def set_hamiltonian(self, hamiltonian):
        """
        Set the Hamiltonian for the VQE problem.
        
        Args:
            hamiltonian: SparsePauliOp representing the Hamiltonian
        """
        self._hamiltonian = hamiltonian
        if self._num_qubits is None:
            self._num_qubits = hamiltonian.num_qubits
        self._ansatz_isa = None
        self._hamiltonian_isa = None
    
    def set_num_qubits(self, num_qubits):
        """Set the number of qubits."""
        self._num_qubits = num_qubits
    
    def set_estimator(self, estimator):
        """
        Set a custom estimator.
        
        Args:
            estimator: Qiskit Estimator primitive
        """
        self._ansatz_isa = None
        self._hamiltonian_isa = None
        self._estimator = estimator
    
    def set_sampler(self, sampler):
        """
        Set a custom sampler.
        
        Args:
            sampler: Qiskit Sampler primitive
        """
        self._sampler = sampler
    
    def set_ansatz_type(self, ansatz_type: str, reps: int = 3, initial_state=None):
        """
        Create an ansatz from predefined types.
        
        Args:
            ansatz_type: Type of ansatz ('RealAmplitudes', 'EfficientSU2', 'RY')
            reps: Number of repetitions in the ansatz
            initial_state: QuantumCircuit for initial state preparation (optional)
        """
        if self._num_qubits is None:
            raise ValueError("Number of qubits must be set before creating ansatz")
        
        ansatz_type = ansatz_type.upper()
        
        if ansatz_type in ["RYCXRY", "RYCX", "REALAMPLITUDES"]:
            temp_ansatz = RealAmplitudes(num_qubits=self._num_qubits, reps=reps).decompose()
        elif ansatz_type == "RY":
            temp_ansatz = TwoLocal(self._num_qubits, "ry", reps=reps).decompose()
        elif ansatz_type == "EFFICIENTSU2":
            temp_ansatz = EfficientSU2(num_qubits=self._num_qubits, reps=reps).decompose()
        else:
            raise ValueError(f"Unsupported ansatz type: {ansatz_type}. "
                           "Use 'RealAmplitudes', 'EfficientSU2', or 'RY'")
        
        if initial_state is not None:
            qc = QuantumCircuit(self._num_qubits)
            qc.compose(initial_state, inplace=True)
            qc.barrier()
            qc.compose(temp_ansatz, inplace=True)
            self._ansatz = qc
        else:
            self._ansatz = temp_ansatz
        
        self._ansatz_isa = None
    
    def set_custom_ansatz(self, ansatz):
        """
        Set a custom ansatz circuit.
        
        Args:
            ansatz: QuantumCircuit or parameterized circuit
        """
        self._ansatz = ansatz.decompose()
        if self._num_qubits is None:
            self._num_qubits = ansatz.num_qubits
        self._ansatz_isa = None
    
    def check_num_parameters(self):
        """Return the number of parameters in the ansatz."""
        if self._ansatz is None:
            raise ValueError("Ansatz not set")
        return self._ansatz.num_parameters
    
    def cost_func(self, params):
        """
        Cost function for VQE optimization.
        
        Args:
            params: Parameter values for the ansatz
            
        Returns:
            Expectation value of the Hamiltonian
        """
        if self._hamiltonian is None:
            raise ValueError("Hamiltonian not set")
        if self._ansatz is None:
            raise ValueError("Ansatz not set")
        
        # Prepare publication for estimator
        if self._ansatz_isa is None:
            pub = (self._ansatz, [self._hamiltonian], [params])
        else:
            pub = (self._ansatz_isa, [self._hamiltonian_isa], [params])
        
        # Run estimation
        if isinstance(self._estimator, AerEstimator):
            result = self._estimator.run(
                circuits=self._ansatz,
                observables=self._hamiltonian,
                parameter_values=params
            ).result()
            cost = result.values[0]
        else:
            result = self._estimator.run(pubs=[pub]).result()
            cost = result[0].data.evs[0]
        
        # Callback tracking
        if self._callback_step_size != 0:
            self._callback_dict["iters"] += 1
            if self._callback_dict["iters"] % self._callback_step_size == 0:
                self._callback_dict["cost_history"].append(cost)
        
        return cost
    
    def optimize(self, optimizer, x0, maxiter, view_optimizer_result=False):
        """
        Run the optimization process.
        
        Args:
            optimizer: Optimization method name
            x0: Initial parameters
            maxiter: Maximum number of iterations
            view_optimizer_result: Whether to print optimizer details
            
        Returns:
            Optimized parameters
        """
        # Prepare ISA circuits for IBM runtime
        if isinstance(self._estimator, EstimatorV2):
            if self._ansatz_isa is None:
                backend = self._estimator.__getattribute__("_backend")
                pm = generate_preset_pass_manager(
                    backend=backend,
                    target=backend.target,
                    optimization_level=3
                )
                self._ansatz_isa = pm.run(self._ansatz)
                self._hamiltonian_isa = self._hamiltonian.apply_layout(
                    self._ansatz_isa.layout
                )
        
        # Run optimization
        if optimizer.upper() != "NFT":
            res = minimize(
                self.cost_func,
                x0,
                method=optimizer,
                options={'maxiter': maxiter}
            )
        else:
            res = minimize(
                self.cost_func,
                x0,
                method=nakanishi_fujii_todo,
                options={'maxfev': maxiter}
            )
        
        if view_optimizer_result:
            print(res)
        else:
            print("Optimization finished")
        
        return res.x
    
    def solve(self, maxiter: int, optimizer: str = "COBYLA", x0=None,
              view_optimizer_result=False, callback_step_size=0):
        """
        Main method to solve the VQE problem.
        
        Args:
            maxiter: Maximum number of iterations
            optimizer: Optimization method ('COBYLA', 'SLSQP', 'NFT', etc.)
            x0: Initial parameters (random if None)
            view_optimizer_result: Whether to print optimizer details
            callback_step_size: Step size for cost history tracking (0 = disabled)
            
        Returns:
            Optimized parameters
        """
        if self._hamiltonian is None:
            raise ValueError("Hamiltonian not set")
        if self._ansatz is None:
            raise ValueError("Ansatz not set")
        
        # Initialize callback tracking
        self._callback_step_size = callback_step_size
        self._callback_dict = {
            "iters": -1,
            "cost_history": [],
        }
        
        # Generate random initial parameters if not provided
        if x0 is None:
            x0 = 2 * np.pi * np.random.rand(self._ansatz.num_parameters)
        elif len(x0) != self._ansatz.num_parameters:
            raise ValueError(f"x0 must have {self._ansatz.num_parameters} parameters")
        
        print(f"Beginning optimization with: {optimizer}")
        
        # Run optimization
        parameters = self.optimize(optimizer, x0, maxiter, view_optimizer_result)
        self._last_parameters = parameters
        
        return parameters
    
    def compute_expectation(self, params=None):
        """
        Compute expectation value with given parameters.
        
        Args:
            params: Parameter values (uses last optimized if None)
            
        Returns:
            Expectation value
        """
        if params is None:
            params = self._last_parameters
        if params is None:
            raise ValueError("No parameters provided and no optimization run yet")
        
        return self.cost_func(params)
    
    def get_circuit(self, params=None, bind_parameters=True):
        """
        Get the VQE circuit with optional parameter binding.
        
        Args:
            params: Parameter values (uses last optimized if None)
            bind_parameters: If True, returns circuit with bound parameters.
                           If False, returns parameterized circuit.
            
        Returns:
            QuantumCircuit (with or without bound parameters)
        """
        if self._ansatz is None:
            raise ValueError("Ansatz not set")
        
        if bind_parameters:
            if params is None:
                params = self._last_parameters
            if params is None:
                raise ValueError("No parameters provided and no optimization run yet")
            
            # Return circuit with parameters assigned
            return self._ansatz.assign_parameters(params)
        else:
            # Return parameterized circuit
            return self._ansatz.copy()
    
    def get_circuit_with_measurements(self, params=None):
        """
        Get the VQE circuit with measurements added.
        
        Args:
            params: Parameter values (uses last optimized if None)
            
        Returns:
            QuantumCircuit with measurements
        """
        qc = self.get_circuit(params=params, bind_parameters=True)
        qc.measure_all()
        return qc
    
    def draw_circuit(self, params=None, output='mpl', **kwargs):
        """
        Draw the VQE circuit.
        
        Args:
            params: Parameter values (uses last optimized if None)
            output: Output format ('mpl', 'text', 'latex')
            **kwargs: Additional arguments for circuit_drawer
            
        Returns:
            Drawn circuit figure
        """
        from qiskit.visualization import circuit_drawer
        qc = self.get_circuit(params=params, bind_parameters=(params is not None))
        return circuit_drawer(qc, output=output, **kwargs)
    
    def sample_circuit(self, params=None, shots=1024):
        """
        Sample the ansatz circuit with given parameters.
        
        Args:
            params: Parameter values (uses last optimized if None)
            shots: Number of shots for sampling
            
        Returns:
            Measurement statistics
        """
        if params is None:
            params = self._last_parameters
        if params is None:
            raise ValueError("No parameters provided and no optimization run yet")
        
        if isinstance(self._sampler, Sampler):
            qc = self._ansatz.assign_parameters(params)
            qc.measure_all()
            result = self._sampler.run(qc).result()
            stats = result.quasi_dists[0]
        else:
            qc = QuantumCircuit(self._num_qubits)
            qc.compose(self._ansatz, inplace=True)
            qc.measure_all()
            backend = self._sampler.__getattribute__("_backend")
            pm = generate_preset_pass_manager(
                backend=backend,
                target=backend.target,
                optimization_level=3
            )
            result = self._sampler.run([(pm.run(qc), params)]).result()[0]
            stats = result.data.meas.get_counts()
        
        self._last_sampler_stats = stats
        return stats
    
    def plot_optimization_history(self, legend=None):
        """
        Plot the cost function history during optimization.
        
        Args:
            legend: Legend label for the plot
        """
        if not self._callback_dict["cost_history"]:
            print("No optimization history available. Run solve() with callback_step_size > 0")
            return
        
        iters = list(range(0, self._callback_dict["iters"] + 1, self._callback_step_size))
        
        # Ensure alignment
        if not (self._callback_dict['iters'] % self._callback_step_size == 0):
            iters.append(self._callback_dict["iters"])
            if self._last_parameters is not None:
                final_cost = self.compute_expectation(self._last_parameters)
                self._callback_dict["cost_history"].append(final_cost)
        
        plt.figure(figsize=(10, 6))
        plt.plot(iters, self._callback_dict["cost_history"][:len(iters)],
                marker='o', linestyle='-')
        plt.xlabel("Iterations")
        plt.ylabel("Cost (Energy)")
        plt.title("VQE Optimization History")
        if legend:
            plt.legend([legend])
        plt.grid(True, alpha=0.3)
        plt.show()
    
    def print_guide(self):
        """Print usage guide."""
        print("VQE Solver Usage Guide:")
        print("1. Set Hamiltonian: set_hamiltonian(hamiltonian)")
        print("2. Set ansatz: set_ansatz_type('RealAmplitudes', reps=3)")
        print("   or use set_custom_ansatz(custom_circuit)")
        print("3. (Optional) Set custom estimator/sampler")
        print("4. Solve: solve(maxiter=100, optimizer='COBYLA')")
        print("5. Analyze results: compute_expectation(), plot_optimization_history()")
    
    def print_optimization_options(self):
        """Print available optimization methods."""
        print("Available Optimization Methods:")
        print("'Nelder-Mead' || 'Powell' || 'CG' || 'NFT'")
        print("'BFGS' || 'Newton-CG' || 'L-BFGS-B'")
        print("'TNC' || 'COBYLA' || 'SLSQP' || 'trust-exact'")
        print("'trust-constr' || 'dogleg' || 'trust-ncg' || 'trust-krylov'")
