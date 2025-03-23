import {SECONDS_IN_HOUR, SECONDS_IN_MINUTE} from "../defaults/time.ts";

export const mapStringDurationToSeconds = (duration: string) => {
    const [_hours, _minutes] = duration.split(":");
    const hours = +_hours;
    const minutes = +_minutes;

    return hours * SECONDS_IN_HOUR + minutes * SECONDS_IN_MINUTE;
}

export const mapSecondsToStringDuration = (seconds: number) => {
    const hours = Math.trunc(seconds / SECONDS_IN_HOUR);
    const minutes = (seconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
