import { useEffect, useState } from "react";
import { Card } from "./ui/card";

function VotesCountdownCard() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    const msLeft = endOfWeek.getTime() - now.getTime();
    return {
      days: Math.floor(msLeft / (1000 * 60 * 60 * 24)),
      hours: Math.floor((msLeft / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((msLeft / (1000 * 60)) % 60),
      seconds: Math.floor((msLeft / 1000) % 60),
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      const msLeft = endOfWeek.getTime() - now.getTime();
      setTimeLeft({
        days: Math.floor(msLeft / (1000 * 60 * 60 * 24)),
        hours: Math.floor((msLeft / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((msLeft / (1000 * 60)) % 60),
        seconds: Math.floor((msLeft / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-8 text-center">
      <h3 className="text- font-medium text-gray-900 mb-2">Tus votos se reiniciaran en: </h3>
      <p className="text-gray-600 mb-4 font-semibold">
        {timeLeft.days} días, {timeLeft.hours} horas, {timeLeft.minutes} minutos, {timeLeft.seconds} segundos restantes.
      </p>
    </Card>
  );
}

export default VotesCountdownCard;