import wave, math, struct, random, os

OUT = "/home/claude/delivery-glider/assets/audio"
os.makedirs(OUT, exist_ok=True)
SR = 22050  # sample rate, keeps file sizes small

def write_wav(path, samples, sr=SR):
    with wave.open(path, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        frames = b"".join(struct.pack("<h", max(-32767, min(32767, int(s)))) for s in samples)
        f.writeframes(frames)

def envelope(i, n, attack=0.05, release=0.3):
    a = attack * n
    r = release * n
    if i < a:
        return i / a
    if i > n - r:
        return max(0.0, (n - i) / r)
    return 1.0

def tone(freq_start, freq_end, dur, sr=SR, wave_shape="sine", vol=0.5, attack=0.05, release=0.4):
    n = int(dur * sr)
    out = []
    for i in range(n):
        t = i / sr
        frac = i / n
        freq = freq_start + (freq_end - freq_start) * frac
        phase = 2 * math.pi * freq * t
        if wave_shape == "sine":
            s = math.sin(phase)
        elif wave_shape == "square":
            s = 1.0 if math.sin(phase) >= 0 else -1.0
        elif wave_shape == "saw":
            s = 2 * (freq * t - math.floor(0.5 + freq * t))
        else:
            s = math.sin(phase)
        env = envelope(i, n, attack, release)
        out.append(s * env * vol * 32767)
    return out

def noise_burst(dur, sr=SR, vol=0.5, lowpass=0.0, attack=0.01, release=0.5):
    n = int(dur * sr)
    out = []
    prev = 0.0
    for i in range(n):
        raw = random.uniform(-1, 1)
        if lowpass > 0:
            raw = prev + (raw - prev) * (1 - lowpass)
            prev = raw
        env = envelope(i, n, attack, release)
        out.append(raw * env * vol * 32767)
    return out

def mix(*tracks):
    n = max(len(t) for t in tracks)
    out = [0.0] * n
    for t in tracks:
        for i, v in enumerate(t):
            out[i] += v
    return out

# 1. thrust.wav - short rising "whoosh" blip for tap-to-fly / hold-to-ascend
thrust = tone(180, 420, 0.16, wave_shape="sine", vol=0.55, attack=0.02, release=0.6)
write_wav(f"{OUT}/thrust.wav", thrust)

# 2. deliver.wav - pleasant two-note chime for successful delivery
n1 = tone(660, 660, 0.11, vol=0.5, attack=0.01, release=0.5)
n2 = tone(990, 990, 0.16, vol=0.5, attack=0.01, release=0.6)
deliver = n1 + n2
write_wav(f"{OUT}/deliver.wav", deliver)

# 3. pickup.wav - short ascending double blip for drone refuel station
p1 = tone(420, 520, 0.07, vol=0.45, attack=0.01, release=0.4)
gap = [0.0] * int(0.02 * SR)
p2 = tone(520, 640, 0.09, vol=0.45, attack=0.01, release=0.4)
pickup = p1 + gap + p2
write_wav(f"{OUT}/pickup.wav", pickup)

# 4. crash.wav - low thud + filtered noise burst for collision / game over
thud = tone(90, 40, 0.25, wave_shape="sine", vol=0.7, attack=0.01, release=0.85)
crashnoise = noise_burst(0.3, vol=0.35, lowpass=0.6, attack=0.01, release=0.8)
crash = mix(thud, crashnoise)
write_wav(f"{OUT}/crash.wav", crash)

# 5. click.wav - short neutral UI click
click = tone(300, 220, 0.045, wave_shape="square", vol=0.25, attack=0.01, release=0.6)
write_wav(f"{OUT}/click.wav", click)

# 6. swipe.wav - quick swoosh for swipe-down dive
swipe = tone(500, 150, 0.13, wave_shape="sine", vol=0.4, attack=0.01, release=0.7)
write_wav(f"{OUT}/swipe.wav", swipe)

print("Generated SFX:", os.listdir(OUT))
