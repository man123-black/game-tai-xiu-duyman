import { useEffect, useState } from "react";

export default function Timer() {
  const [time, setTime] = useState(60);

  useEffect(() => {
    const i = setInterval(() => {
      setTime(t => (t === 0 ? 60 : t - 1));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  return <div className="timer">⏱ {time}s</div>;
}
