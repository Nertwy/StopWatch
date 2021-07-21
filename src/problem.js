import { fromEvent, interval, merge, noop, NEVER } from "rxjs";
import {
  map,
  mapTo,
  scan,
  startWith,
  switchMap,
  tap,
  debounceTime,
  buffer,
  filter,
  count,
  throttleTime,
} from "rxjs/operators";


const getElem = (id) => document.getElementById(id);
const getVal = (id) => parseInt(getElem(id)["value"]);
const fromClick = (id) => fromEvent(getElem(id), "click");
const fromClickAndMapTo = (id, obj) => fromClick(id).pipe(mapTo(obj));
const fromClickAndMap = (id, fn) => fromClick(id).pipe(map(fn));
const setValue = (val) => {
  // console.log(new Date(1626728400000 + val*1000).toLocaleTimeString());
  getElem("counter").innerText = new Date(
    1626728400000 + val * 1000
  ).toLocaleTimeString();
};
const mouse$ = fromEvent(getElem("wait"), "click");

const buff$ = mouse$.pipe(debounceTime(240));

const click$ = mouse$.pipe(
  buffer(buff$),
  map((list) => {
    return list.length;
  }),
  filter((x) => x === 2)
);

const events$ = merge(
  fromClickAndMapTo("start", { count: true }),
  fromClickAndMapTo("stop", { count: false, value: 0 }),
  fromClickAndMapTo("reset", { value: 0 }),
  fromClickAndMapTo('wait',{count:false}),
  //fromClickAndMapTo('countup', { countup: true }),
  //fromClickAndMapTo('countdown', { countup: false }),
  //fromClickAndMap('setto', _ => ({ value: getVal('value') })),
  fromClickAndMap("setspeed", (_) => ({ speed: getVal("speed") }))
  //fromClickAndMap('setincrease', _ => ({ increase: getVal('increase') }))
);
const stopWatch$ = events$.pipe(
  startWith({
    count: false,
    speed: 1000,
    value: 0,
    countup: true,
    increase: 1,
  }),
  scan((state, curr) => ({ ...state, ...curr }), {}),
  tap((state) => setValue(state.value)),
  switchMap((state) =>
    state.count
      ? interval(state.speed).pipe(
          tap(
            (_) =>
              (state.value += state.countup ? state.increase : -state.increase)
          ),
          tap((_) => setValue(state.value))
        )
      : NEVER
  )
);

stopWatch$.subscribe();
