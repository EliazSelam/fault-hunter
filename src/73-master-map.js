/* ============ Master map: every asset on a level of its subject's cone ============
   Data only. Nothing in the interface reads it yet; tests/master_map.mjs checks that every page, simulation, figure,
   question and fault appears here, and writes docs/MASTER_MAP.md for review.
   Levels: 0 essence · 1 intuition · 2 structure and flow · 3 engineering depth · 4 math and physics · 5 advanced · 6 chapter quiz · 7 integration
   Refs: p:route (page) · p:route#full (its long reading) · p:route#math (its formulas) · s2:id#stage · t:topic/level · sim:id · fig:id · cj:id (CircuitJS) · qb:t (all questions of a topic) · q:ID · scn:sys (all faults of a system) · x:subject (link to another subject) */
const MASTER_LEVELS = ['המהות', 'אינטואיציה', 'מבנה וזרימה', 'עומק הנדסי', 'מתמטיקה ופיזיקה', 'נושאים מתקדמים', 'שאלון הפרק', 'אינטגרציה'];
const MASTER_TRACKS = [['found', 'יסודות'], ['sub', 'תת-מערכות במכונה'], ['mach', 'המכונה השלמה'], ['res', 'משאבים רוחביים']];
const MASTER = [
  /* foundations */
  { id: 'draw', track: 'found', t: 'שרטוט, רכיבים ודרייברים', L: [
    ['fig:relay', 'p:b'], ['p:b/grammar', 'p:b/quiz'], ['p:b/decode', 'p:b/board'],
    ['p:b/atlas', 'p:b/set', 'p:s1/relay', 'p:s1/pwm', 'p:s1/limit', 'p:lib/drive', 'p:lib/do', 'p:lib/di'],
    ['p:s1/relay#math', 'p:s1/pwm#math'], ['p:s1/relay#full', 'p:s1/pwm#full', 'p:s1/limit#full'],
    ['qb:sw', 'qb:drv', 'scn:b:atlas', 'scn:b:decode', 'scn:b:board'], ['x:pwr', 'x:safety', 'x:boards']] },
  { id: 'mechdraw', track: 'found', t: 'שרטוט מכני וטולרנסים', L: [
    ['p:b/mech'], ['p:b/mdrill'], ['p:s1/fits'], ['p:s1/fits', 'p:s1/thermal'], ['p:s1/fits#math', 'p:s1/thermal#math'], ['p:s1/fits#full', 'p:s1/thermal#full'],
    ['scn:b:mech', 'scn:s1:fits'], ['x:servo', 'x:bringup']] },
  { id: 'dig', track: 'found', t: 'לוגיקה ספרתית', L: [
    ['p:dig/why'], ['p:dig/tbl'], ['p:dig/sr', 'p:dig/dl'], ['p:dig/dff', 'p:dig/jk', 'p:dig/t', 'p:dig/reg', 'p:dig/cnt', 'p:dig/lab'], ['p:dig/timing'], ['p:dig/timing#full'],
    ['qb:dig', 'p:dig/q'], ['x:boards']] },
  { id: 'meas', track: 'found', t: 'מדידה, מכשירים וחיישנים', L: [
    ['p:lab'], ['p:lab/dmm'], ['p:lab/s-wire', 'p:s1/loop'], ['p:lab/scope', 'p:lab/s-prox', 'p:lab/s-photo', 'p:lab/s-temp', 'p:lab/s-bridge', 'p:lab/s-hall', 'p:lib/ai'],
    ['p:s1/loop#math'], ['p:s1/loop#full'], ['qb:lin', 'scn:s1:loop'], ['x:bringup', 'x:boards']] },
  { id: 'elec', track: 'found', t: 'חשמל, מכונות והמרת הספק', L: [
    ['sim:mlab', 'sim:im3d', 'p:mot'], ['p:mot/why', 'p:mot/parts'], ['p:mot/wire', 'p:mot/iface', 'p:mot/energy'],
    ['p:mot/types', 'sim:st3d', 'p:mot/dcm', 'p:mot/ind', 'p:mot/sync', 'p:mot/tri', 'p:mot/xfmr', 'p:mot/conv', 'sim:clab', 'p:mot/lab'],
    ['p:mot/why#math', 'p:mot/conv#math'], ['p:mot/sims', 'cj:dcmotor', 'cj:3motor', 'cj:motorprotect', 'cj:buck', 'cj:boost', 'cj:xfmr', 'cj:rect', 'cj:3phase'],
    ['qb:mot', 'p:mot/q'], ['x:servo', 'x:pwr', 'x:safety']] },
  /* subsystems */
  { id: 'servo', track: 'sub', t: 'תנועה: ציר סרבו', L: [
    ['t:servo/show', 'sim:bs3d'], ['t:servo/ask', 's2:servo#intro'], ['t:servo/arch', 's2:servo#normal'],
    ['t:servo/eng', 't:servo/rev', 't:servo/fault', 's2:servo#prin', 's2:servo#worked', 'p:s1/encoder', 'p:s1/screw', 'p:s1/brake'],
    ['t:servo/math', 'p:s1/encoder#math', 'p:s1/screw#math'], ['p:s1/encoder#full', 'p:s1/screw#full', 'p:s1/brake#full'],
    ['qb:mech', 's2:servo#guided', 's2:servo#solo', 'scn:s2:servo', 'scn:s1:encoder', 'scn:s1:screw', 'scn:s1:brake'], ['t:servo/integ', 'x:elec', 'x:ecat']] },
  { id: 'vac', track: 'sub', t: 'ואקום ופניאומטיקה', L: [
    ['t:vac/show'], ['t:vac/ask', 's2:vac#intro'], ['t:vac/arch', 's2:vac#normal'],
    ['t:vac/eng', 't:vac/rev', 't:vac/fault', 's2:vac#prin', 's2:vac#worked', 'p:s1/cyl'], ['t:vac/math', 'p:s1/cyl#math'], ['p:s1/cyl#full'],
    ['s2:vac#guided', 's2:vac#solo', 'scn:s2:vac', 'scn:s1:cyl'], ['t:vac/integ', 'x:aoi']] },
  { id: 'cam', track: 'sub', t: 'אופטיקה, מצלמה ותאורה', L: [
    ['t:cam/show', 'sim:scan3d', 'fig:linescan', 'p:opt', 'p:opt/ov'], ['t:cam/ask'], ['t:cam/arch'],
    ['t:cam/eng', 't:cam/rev', 't:cam/fault', 'p:s1/linescan', 'p:s1/strobe', 'p:s1/lens', 'p:s1/tilt', 'p:opt/linescan', 'p:opt/strobe', 'p:opt/lens', 'p:opt/tilt', 'p:opt/thermal'],
    ['t:cam/math', 'p:s1/linescan#math', 'p:s1/lens#math'], ['p:s1/linescan#full', 'p:s1/strobe#full', 'p:s1/lens#full', 'p:s1/tilt#full'],
    ['qb:opt', 'p:opt/q', 'p:opt/ch', 'scn:s1:strobe', 'scn:s1:linescan', 'scn:s1:lens', 'scn:s1:tilt'], ['t:cam/integ', 'x:aoi', 'x:servo']] },
  { id: 'aos', track: 'sub', t: 'לייזר ו-AOS', L: [
    ['t:aos/show', 'fig:aos', 'sim:cr3d'], ['t:aos/ask', 's2:aos#intro'], ['t:aos/arch', 's2:aos#normal'],
    ['t:aos/eng', 't:aos/rev', 't:aos/fault', 's2:aos#prin', 's2:aos#worked', 'p:s1/laser', 'p:opt/laser'], ['t:aos/math', 'p:s1/laser#math'], ['p:s1/laser#full'],
    ['s2:aos#guided', 's2:aos#solo', 'scn:s2:aos'], ['t:aos/integ', 'x:aoi', 'x:industry']] },
  { id: 'pwr', track: 'sub', t: 'ספק 24V וחלוקה', L: [
    ['t:pwr/show'], ['t:pwr/ask'], ['t:pwr/arch'], ['t:pwr/eng', 't:pwr/rev', 't:pwr/fault', 'p:s1/psu', 'p:lib/psu'], ['t:pwr/math', 'p:s1/psu#math'], ['p:s1/psu#full'],
    ['scn:s1:psu'], ['t:pwr/integ', 'x:ecat', 'x:bringup']] },
  { id: 'ecat', track: 'sub', t: 'תקשורת EtherCAT', L: [
    ['t:ecat/show'], ['t:ecat/ask'], ['t:ecat/arch'], ['t:ecat/eng', 't:ecat/rev', 't:ecat/fault', 'p:lib/comm'], ['t:ecat/math'], ['p:lib/comm#full'],
    ['t:ecat/fault'], ['t:ecat/integ', 'x:pwr', 'x:servo']] },
  { id: 'safety', track: 'sub', t: 'בטיחות', L: [
    ['t:safety/show'], ['t:safety/ask', 's2:interlock#intro'], ['t:safety/arch', 's2:interlock#normal'],
    ['t:safety/eng', 't:safety/rev', 't:safety/fault', 's2:interlock#prin', 's2:interlock#worked', 'p:s1/limit'], ['t:safety/math'], ['p:s4'],
    ['s2:interlock#guided', 's2:interlock#solo', 'scn:s2:interlock', 'scn:s1:limit'], ['t:safety/integ', 'x:bringup']] },
  /* the whole machine */
  { id: 'aoi', track: 'mach', t: 'מחזור בדיקה במכונת AOI', L: [
    ['t:aoi/show'], ['t:aoi/ask', 's2:machine#intro'], ['t:aoi/arch', 's2:machine#normal'],
    ['t:aoi/eng', 't:aoi/rev', 't:aoi/fault', 's2:machine#prin', 's2:machine#worked', 'p:s1/fid', 'p:opt/fid'], ['t:aoi/math', 'p:s1/fid#math'], ['p:s1/fid#full', 'p:s3'],
    ['s2:machine#guided', 's2:machine#solo', 'scn:s2:machine', 'scn:s1:fid'], ['t:aoi/integ', 'x:cam', 'x:vac', 'x:servo']] },
  { id: 'boards', track: 'mach', t: 'כרטיסים וחקר כשל', L: [
    ['p:brd'], ['p:brd/steps', 's2:card#intro'], ['p:lib/led', 's2:card#normal'], ['p:brd/lib', 'p:brd/bench', 's2:card#prin', 's2:card#worked'], ['s2:card#prin'], ['p:brd/fa'],
    ['qb:fa', 'p:brd/q', 'p:brd/ch', 's2:card#guided', 's2:card#solo', 'scn:s2:card'], ['x:draw', 'x:meas']] },
  { id: 'bringup', track: 'mach', t: 'הפעלה ראשונה, ATP ושטח', L: [
    ['t:bringup/show', 'p:int'], ['t:bringup/ask', 'p:int/zero'], ['t:bringup/arch', 'p:int/flow'], ['t:bringup/eng', 't:bringup/rev', 't:bringup/fault', 'p:int/power', 'p:int/atp', 'p:int/tools'],
    ['t:bringup/math'], ['p:int/field'], ['qb:int'], ['t:bringup/integ', 'x:pwr', 'x:safety', 'x:servo']] },
  { id: 'industry', track: 'mach', t: 'הקשר תעשייתי: PCB, AOI ו-AOS', L: [
    ['p:pcb', 'p:pcb/ov'], ['p:pcb/pcba'], ['p:pcb/line'], ['p:pcb/def', 'p:pcb/prod'], ['p:pcb/kpi'], ['p:pcb/kpi#full'], ['qb:pcb'], ['x:aoi', 'x:aos']] },
  /* resources that serve every subject */
  { id: 'res', track: 'res', t: 'משאבים רוחביים', L: [
    ['p:topic', 'p:path'], ['p:pri'], [], [], [], ['p:gl', 'p:s0'], ['p:qb', 'p:ch', 't:*/review'], ['p:s3']] }
];
