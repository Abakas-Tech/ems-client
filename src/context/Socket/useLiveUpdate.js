import { useEffect, useRef } from "react";
import useSocket from "./useSocket";

// Re-runs `onChange` whenever the server broadcasts a "data:changed" event
// for one of the given modules/entity types — used so open list/detail
// pages refetch live instead of only updating on the next manual page
// load. `modules` is a module name (e.g. "workers"), an array of them, or
// "*" to match every change (used by the activity feed, which shows
// everything); matches against both the event's `module` and `entityType`
// fields since controllers don't always populate both the same way.
const useLiveUpdate = (modules, onChange) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const socket = useSocket();
  const matchAll = modules === "*";
  const list = matchAll ? [] : Array.isArray(modules) ? modules : [modules];
  const key = matchAll ? "*" : list.join(",");

  useEffect(() => {
    if (!socket) return;

    const handler = (event) => {
      if (!event) return;
      if (
        matchAll ||
        list.includes(event.module) ||
        list.includes(event.entityType)
      ) {
        onChangeRef.current(event);
      }
    };

    socket.on("data:changed", handler);
    return () => socket.off("data:changed", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, key]);
};

export default useLiveUpdate;
