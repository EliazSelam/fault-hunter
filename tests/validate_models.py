"""Independent validation of the Fault Hunter simulations.

Each model is re-implemented here from the physics (not copied from the JS), run over a
parameter grid, and every expected quantity must appear in the simulation readout within
rounding of the displayed digits. Servo: an RK4 integration of the continuous plant + PID.
Fiducials: numpy least squares. PWM: exact steady-state RL solution.
"""
import json, math, subprocess, sys, itertools, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get('VALIDATE_OUT', '/tmp')
cases = []
def add(cid, s, exp, sys_=False, note=''):
    cases.append({'id': cid, 's': s, 'exp': exp, 'sys': sys_, 'note': note})

# ---- PWM into an RL motor model: exact periodic steady state (V=24 V, R=2 Ω, L=1 mH)
V, R, L = 24.0, 2.0, 1e-3
tau = L / R
for D, fk in itertools.product([10, 40, 75], [0.2, 1, 5, 20, 40]):
    d, T = D / 100, 1 / (fk * 1e3)
    imax = V / R * (1 - math.exp(-d * T / tau)) / (1 - math.exp(-T / tau))
    imin = imax * math.exp(-(1 - d) * T / tau)
    add('pwm', {'duty': D, 'freq': fk}, [(d * V, 1), (d * V / R, 1), (imax - imin, 2)], note=f'D={D}% f={fk}kHz')

# ---- Line-scan: pixel 7 µm, camera max 40 kHz, clock mode 20 kHz
for v, mode, exp in itertools.product([40, 140, 280, 400], ['enc', 'time'], [5, 20, 60]):
    need = v / 7
    rate = min(need, 40) if mode == 'enc' else 20
    aspect = (v / rate) / 7
    blur = v * exp * 1e-3          # mm/s × µs → µm
    add('linescan', {'v': v, 'mode': mode, 'exp': exp}, [(need, 1), (rate, 1), (aspect, 2), (blur, 1), (blur / 7, 2)])

# ---- Lens: geometric blur 2·NA·Δz combined with Airy diameter 1.22 λ/NA; DOF ≈ λ/NA²; Rayleigh 0.61 λ/NA
lam = 0.5
for dz, na in itertools.product([0, 10, -25, 60], [0.05, 0.1, 0.2, 0.35]):
    b = math.hypot(2 * na * abs(dz), 1.22 * lam / na)
    add('lens', {'dz': dz, 'na': na}, [(b, 1), (lam / na ** 2, 1), (0.61 * lam / na, 2)])

# ---- Tilt: edge height θ·FOV/2 (mrad·mm = µm) against DOF/2
for th, fov, na in itertools.product([0, 0.6, 2], [10, 32, 60], [0.05, 0.15, 0.3]):
    edge, half = th * fov / 2, lam / na ** 2 / 2
    frac = 1 if edge <= half else half / edge
    add('tilt', {'th': th, 'fov': fov, 'na': na}, [(edge, 1), (half, 1), (frac * 100, 0)])

# ---- Thermal: ΔL = α·L·ΔT, α in 1e-6/K
ALPHA = {'al': 23, 'st': 12, 'gr': 6, 'inv': 1.2}
for m, Lm, dT, na in itertools.product(ALPHA, [20, 100, 200], [0, 8, 20], [0.05, 0.2, 0.4]):
    add('thermal', {'m': m, 'L': Lm, 'dT': dT, 'na': na}, [(ALPHA[m] * Lm * dT / 1000, 1), (lam / na ** 2, 1)])

# ---- PSU cable drop: two conductors, ρ_Cu = 0.0175 Ω·mm²/m
for I, Lc, A in itertools.product([0.5, 4, 10], [1, 8, 25], ['0.5', '0.75', '1.5', '2.5']):
    Rw = 0.0175 * Lc / float(A)
    drop = 2 * I * Rw
    add('psu', {'I': I, 'L': Lc, 'A': A}, [(drop, 2), (24 - drop, 2)])

# ---- Brake sequencing: uncontrolled window and sag with a = 1 m/s² (partially balanced axis)
for order, dly, te in itertools.product(['ok', 'bad'], [0, 20, 60, 120], [10, 40, 80]):
    t0 = 50
    tdis, tcoil = (t0 + dly, t0) if order == 'ok' else (t0, t0 + dly)
    gap = max(0, tcoil + te - tdis) / 1000
    add('brake', {'ord': order, 'd': dly, 'te': te}, [(gap * 1000, 0), (0.5 * 1.0 * gap ** 2 * 1000, 2)])

# ---- 4–20 mA, 0–10 bar, 250 Ω shunt
for p, f in itertools.product([0, 2.5, 6, 10], ['ok', 'brk', 'sh']):
    I = {'ok': 4 + 16 * p / 10, 'brk': 0, 'sh': 24}[f]
    read = p if f == 'ok' else (I - 4) / 16 * 10
    add('loop', {'p': p, 'f': f}, [(I, 2), (I * 0.25, 2), (read, 2)])

# ---- ISO 286 fits, Ø6 (range 3–6 mm): H7 = 0/+12, g6 = −12/−4, h6 = −8/0, k6 = +1/+9, p6 = +12/+20
SH = {'g6': (-12, -4), 'h6': (-8, 0), 'k6': (1, 9), 'p6': (12, 20)}
for k, (lo, hi) in SH.items():
    add('fits', {'sh': k}, [(0 - hi, 0), (12 - lo, 0)])

# ---- Strobe: exposure 20 µs, line rate 10 kHz, model P = 4 V · I · duty, 0.5 K/W, Al 100 mm (2.3 µm/K)
for mode, I, pw, dl in itertools.product(['pulse', 'cont'], [0.5, 5, 10], [2, 15, 40], [0, 2, 10, 40]):
    on0, on1 = (0, 50) if mode == 'cont' else (dl, dl + pw)
    ov = max(0, min(20, on1) - max(0, on0))
    duty = 1 if mode == 'cont' else min(1, pw * 10 / 1000)
    P = 4 * I * duty
    add('strobe', {'mode': mode, 'I': I, 'pw': pw, 'dl': dl}, [(ov, 0), (duty * 100, 1), (P, 1), (2.3 * 0.5 * P, 1), (lam / 0.04 / 2, 1)])

# ---- Repair laser: Gaussian beam, λ = 0.355 µm, w0 = 6 µm, F_th = 1.5 J/cm², δ = 0.4 µm
def laser(E, dz, N, fault):
    T = 0.6 if fault == 'dirty' else 1
    A = 0.7 if fault == 'aging' else 1
    Ee = E * T * A
    zr = math.pi * 6 ** 2 / 0.355
    w = 6 * math.sqrt(1 + (dz / zr) ** 2)
    F0 = 2 * Ee * 1e-6 / (math.pi * (w * 1e-4) ** 2)   # J / cm²
    Lg = math.log(F0 / 1.5) if F0 > 1.5 else 0
    return Ee, w, F0, w * math.sqrt(2 * Lg), N * 0.4 * Lg
for E, dz, N, fault in itertools.product([1, 4, 10], [0, 300, 500], [1, 10, 30], ['none', 'dirty', 'aging', 'reg']):
    Ee, w, F0, D, dep = laser(E, dz, N, fault)
    add('laser', {'E': E, 'dz': dz, 'N': N, 'fault': fault}, [(Ee, 2), (w, 2), (F0, 2), (D, 1), (dep, 1)])

# ---- Fiducials, noise-free: compare to numpy least squares over the same 11×9 grid
F = np.array([[-240, -190], [240, -190], [240, 190], [-240, 190]], float)
G = np.array([[-250 + 50 * i, -200 + 50 * j] for i in range(11) for j in range(9)], float)
def fid_ref(ppm, urad, mode):
    sc, th, t = 1 + ppm * 1e-6, urad * 1e-6, np.array([0.030, -0.020])
    Rm = np.array([[math.cos(th), -math.sin(th)], [math.sin(th), math.cos(th)]])
    truth = lambda P: sc * P @ Rm.T + t
    meas = truth(F)
    if mode == 'none':
        model = G
    elif mode == 'shift':
        model = G + (meas - F).mean(axis=0)
    else:
        Aa = np.c_[F, np.ones(4)]
        cx = np.linalg.lstsq(Aa, meas[:, 0], rcond=None)[0]
        cy = np.linalg.lstsq(Aa, meas[:, 1], rcond=None)[0]
        model = np.c_[np.c_[G, np.ones(len(G))] @ cx, np.c_[G, np.ones(len(G))] @ cy]
    e = np.linalg.norm(truth(G) - model, axis=1) * 1000
    return e.max(), math.sqrt((e ** 2).mean())
for ppm, urad, mode in itertools.product([0, 50, 100, 150], [0, 150, 400], ['none', 'shift', 'affine']):
    mx, rms = fid_ref(ppm, urad, mode)
    add('fid', {'ppm': ppm, 'urad': urad, 'sig': 0, 'mode': mode}, [(mx, 1), (rms, 1)])

# ---- Servo: J ẍ = u − b ẋ, PID with derivative on measurement, |u| ≤ 400; RK4 at 20 µs
def servo_ref(kp, ki, kd, J=1, b=1, umax=400, Tend=1.2, dt=2e-5):
    x = v = I = 0.0; os_ = 0.0; last_out = 0.05
    t = 0.0
    while t <= Tend:
        ref = 1 if t > 0.05 else 0
        e = ref - x
        u = kp * e + ki * I - kd * v
        u = max(-umax, min(umax, u))
        # RK4 on (x, v) with u held over the step (zero-order hold, like a sampled controller)
        f = lambda X, Vv: (Vv, (u - b * Vv) / J)
        k1 = f(x, v); k2 = f(x + dt / 2 * k1[0], v + dt / 2 * k1[1]); k3 = f(x + dt / 2 * k2[0], v + dt / 2 * k2[1]); k4 = f(x + dt * k3[0], v + dt * k3[1])
        x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); v += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
        I += e * dt; t += dt
        if t > 0.05:
            os_ = max(os_, x - 1)
            if abs(x - 1) > 0.02: last_out = t
    return os_ * 100, (last_out - 0.05) * 1000
for kp, kd, ki in [(400, 40, 50), (400, 40, 200), (2500, 10, 0), (400, 5, 0), (100, 60, 0), (1200, 30, 500)]:
    osr, tsr = servo_ref(kp, ki, kd)
    zeta, wn = (1 + kd) / (2 * math.sqrt(kp)), math.sqrt(kp)
    add('servo', {'kp': kp, 'kd': kd, 'ki': ki}, [('os', osr), ('ts', tsr), (zeta, 2), (wn, 0)], sys_=True)


# ---- Lab: multimeter on the 24 V circuit (supply 0.05 Ω, F1 0.05 Ω, S1 0.01 Ω, coil 480 Ω; meter 10 MΩ / 10 Ω mA / 0.05 Ω A)
def par(a, b): return a * b / (a + b)
I_on = 24 / (0.05 + 0.05 + 0.01 + par(480, 10e6))
add('dmm', {'power': 'on', 'mode': 'vdc', 'jack': 'V', 'red': '3', 'blk': '0'}, [(I_on * par(480, 10e6), 2)], note='V across coil'); cases[-1]['lab'] = 'LAB_DMM'
add('dmm', {'power': 'on', 'sw': 'open', 'mode': 'A', 'jack': 'mA', 'red': '2', 'blk': '3'}, [(24 / (0.05 + 0.05 + 10 + 480) * 1000, 1)], note='series current, mA jack'); cases[-1]['lab'] = 'LAB_DMM'
add('dmm', {'power': 'off', 'mode': 'ohm', 'jack': 'V', 'red': '1', 'blk': '0'}, [(0.05 + 0.01 + 480, 1)], note='resistance, power off'); cases[-1]['lab'] = 'LAB_DMM'
add('dmm', {'power': 'on', 'fault': 'sw', 'mode': 'vdc', 'jack': 'V', 'red': '2', 'blk': '0'}, [(24 * 10e6 / (10e6 + 0.1), 2)], note='fault B: TP2 still 24 V'); cases[-1]['lab'] = 'LAB_DMM'
# ---- Lab: generator into a load, RC low-pass (τ = 100 µs), Schmitt ±1 V → ±5 V
fc = 1 / (2 * math.pi * 1e-4)
for zs, load, vpp, f in itertools.product(['hiz', '50'], ['1M', '50'], [2, 4], [100, 1592, 20000]):
    k = (2 if zs == '50' else 1) * (1e6 if load == '1M' else 50) / (50 + (1e6 if load == '1M' else 50))
    A = vpp / 2 * k; H = 1 / math.sqrt(1 + (f / fc) ** 2)
    add('scope', {'zs': zs, 'load': load, 'vpp': vpp, 'f': str(f), 'wave': 'sine', 'dut': 'rc', 'mode': 'yt'}, [(2 * A, 2), (2 * A * H, 2), (-math.degrees(math.atan(f / fc)), 0)]); cases[-1]['lab'] = 'LAB_SCOPE'   # lag shown as a negative phase
add('scope', {'vpp': 4, 'f': '1000', 'wave': 'sine', 'dut': 'schmitt', 'probe': 'x1'}, [(0.4, 2), (1.0, 2)], note='x10 probe read as x1'); cases[-1]['lab'] = 'LAB_SCOPE'
# ---- Lab: sensors
for mat, kk in [('steel', 1), ('al', 0.4), ('brass', 0.5)]:
    add('prox', {'type': 'ind', 'mat': mat, 'd': 0.5}, [(4 * kk, 1), (4 * kk * 1.1, 1)]); cases[-1]['lab'] = 'SENS_BENCH.prox'
for col, R in [('white', 0.9), ('gray', 0.18), ('black', 0.06)]:
    add('photo', {'col': col}, [(100 * math.sqrt(R / 0.9), 0)]); cases[-1]['lab'] = 'SENS_BENCH.photo'
for T in [-20, 0, 25, 100, 300]:
    pt = 100 * (1 + 0.00385 * T); ntc = 10000 * math.exp(3950 * (1 / (T + 273.15) - 1 / 298.15)); tc = 0.041 * (T - 25)
    add('temp', {'T': T, 'cj': 25, 'cjc': 'on'}, [(pt, 1), (ntc / 1000 if ntc >= 1000 else ntc, 2 if ntc >= 1000 else 0), (tc, 2), (T, 0)]); cases[-1]['lab'] = 'SENS_BENCH.temp'
    add('temp', {'T': T, 'cj': 25, 'cjc': 'off'}, [(T - 25, 0)]); cases[-1]['lab'] = 'SENS_BENCH.temp'
for p_, vx in [(0, 10), (5, 10), (10, 5)]:
    add('bridge', {'p': p_, 'vx': vx}, [(vx * 0.002 * p_ / 10 * 1000, 2)]); cases[-1]['lab'] = 'SENS_BENCH.bridge'
for d in [2, 6, 12]:
    B = 100 * (2 / d) ** 3
    add('hall', {'d': d, 'pol': 'n'}, [(B, 1), (max(0.5, min(4.5, 2.5 + 0.025 * B)), 2)]); cases[-1]['lab'] = 'SENS_BENCH.hall'
for st, ct, ok in [('pnp', 'sink', 24), ('pnp', 'src', 0), ('npn', 'src', 24), ('npn', 'sink', 0)]:
    add('wire', {'st': st, 'ct': ct, 'act': 'on'}, [(ok, 0)]); cases[-1]['lab'] = 'SENS_BENCH.wire'

# ---- run the browser harness
cj, rj = os.path.join(OUT, 'kla_cases.json'), os.path.join(OUT, 'kla_results.json')
json.dump(cases, open(cj, 'w'))
subprocess.run(['node', os.path.join(HERE, 'model_harness.js'), cj, rj], check=True, cwd=OUT)
res = json.load(open(rj))

fails, counts = [], {}
for r in res:
    counts.setdefault(r['id'], [0, 0])
    nums = r['nums']
    for item in r['exp']:
        counts[r['id']][0] += 1
        if item[0] == 'os':          # servo overshoot: first number in readout (percent, 0 dp)
            got, ok = nums[0], abs(nums[0] - item[1]) <= max(1.5, 0.05 * item[1])
        elif item[0] == 'ts':        # settling time in ms, or "לא מתייצב"
            import re
            mm = re.search(r'\(±2%\):\s*(\d+) ms', r['txt'])
            got = int(mm.group(1)) if mm else None
            ref_settled = item[1] < 1100   # reference enters ±2% before the 1.2 s window ends
            ok = (got is None and not ref_settled) or (got is not None and ref_settled and abs(got - item[1]) <= max(6, 0.05 * item[1]))
        else:
            val, dp = item
            tol = 0.5 * 10 ** -dp + 1e-3 * abs(val) + 1e-9   # display rounding + 0.1% for time-stepped models
            got = [n for n in nums if abs(n - round(val, dp)) <= tol]
            ok = bool(got)
        if ok: counts[r['id']][1] += 1
        else: fails.append((r['id'], r['s'], item, got if item[0] in ('os', 'ts') else nums[:8], r['txt'][:160]))

print('model        checks  passed')
for k, (n, p) in counts.items(): print(f'{k:<12} {n:>6}  {p:>6}')
print('TOTAL', sum(c[0] for c in counts.values()), 'checks,', len(fails), 'failures')
for f in fails[:40]: print('FAIL', f)
sys.exit(1 if fails else 0)
