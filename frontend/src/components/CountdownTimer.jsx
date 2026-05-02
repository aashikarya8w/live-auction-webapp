import { useEffect, useState } from "react";
import { getTimeRemaining } from "../utils/helpers";

const CountdownTimer = ({ endTime }) => {
  const [time, setTime] = useState(getTimeRemaining(endTime));

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(endTime);
      setTime(remaining);

      // ⛔ Stop if ended
      if (remaining === "Auction Ended") {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  // ⛔ Auction ended
  if (!time || time === "Auction Ended") {
    return (
      <p className="text-red-500 font-semibold">
        Auction Ended
      </p>
    );
  }

  // 🔥 Highlight if ending soon
  const isEndingSoon =
    time.includes("0d 0h") || time.includes("0h 0m");

  return (
    <div
      className={`font-semibold ${
        isEndingSoon ? "text-red-500" : "text-gray-700"
      }`}
    >
      ⏳ {time}
    </div>
  );
};

export default CountdownTimer;