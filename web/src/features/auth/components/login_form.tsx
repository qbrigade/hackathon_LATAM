import { useForm } from 'react-hook-form';
import { Button } from '@common/components/button';
import { Link, useLocation } from 'wouter';
import { db } from '@db/client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getRedirectURL } from '@common/utils';

type Inputs = {
  email: string;
  password: string;
};

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

  const signInEmail = async (data: Inputs) => {
    const { email, password } = data;

    const { error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage('');
      setLocation('/');
    }
  };

  const signInGoogle = async () => {
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectURL(),
      }
    });
    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white border border-[#D9D9D9] rounded-lg p-8">
        <div className="flex flex-col items-center mb-2">
          <h2 className="text-[30px] font-bold text-gray-900 mb-1">Iniciar sesión</h2>
          <div className="text-[#757575] text-[14px] text-center w-full mb-4">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/signup" className="underline cursor-pointer">
              Regístrate
            </Link>
          </div>
          <div className="flex flex-col w-full gap-2">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-[#D9D9D9] rounded-lg p-2 text-[#404040] hover:bg-gray-50"
              onClick={() => signInGoogle()}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"
                className="h-[18px] w-[18px] " />
              Continuar con Google
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-[#D9D9D9]"></div>
              <span className="px-4 text-[#757575] text-sm">o</span>
              <div className="flex-1 border-t border-[#D9D9D9]"></div>
            </div>
          </div>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit(signInEmail)}>
          <label className="text-[#404040] mb-2">Correo electrónico</label>
          <input
            type="email"
            placeholder="Email"
            className="border border-[#D9D9D9] rounded-lg p-2 mb-2 w-full text-[#404040]"
            {...register('email', { required: 'Campo requerido' })}
          />
          {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>}

          <label className="text-[#404040] mb-2 mt-2">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              autoComplete='current-password'
              className="border border-[#D9D9D9] rounded-lg p-2 pr-10 w-full text-[#404040]"
              {...register('password', { required: 'Campo requerido' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>}

          {errorMessage && <p className="text-red-600 text-sm mb-2">{errorMessage}</p>}

          <Button
            variant="red"
            className="font-semibold w-full mt-4"
            type="submit"
            disabled={isSubmitting}
          >
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  );
};
