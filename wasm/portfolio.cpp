extern "C" {

float heightmap[196608]; // 512x384 max

static float hash(int x, int y) {
  int n = x + y * 57;
  n = (n << 13) ^ n;
  return (float)(1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
}

static float smooth(float x, float y) {
  int ix = (int)x, iy = (int)y;
  float fx = x - ix, fy = y - iy;
  fx = fx * fx * (3.0f - 2.0f * fx);
  fy = fy * fy * (3.0f - 2.0f * fy);
  float a = hash(ix, iy), b = hash(ix + 1, iy);
  float c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

static float fbm(float x, float y) {
  float v = 0, a = 1, f = 1;
  for (int i = 0; i < 6; i++) {
    v += a * smooth(x * f, y * f);
    f *= 2.1f; a *= 0.48f;
  }
  return v;
}

void gen_terrain(int w, int h, float t, float s) {
  for (int y = 0; y < h; y++)
    for (int x = 0; x < w; x++) {
      float nx = (float)x / (float)w * s + t * 0.08f;
      float ny = (float)y / (float)h * s + t * 0.06f;
      heightmap[y * w + x] = fbm(nx, ny) * 2.0f - 1.0f;
    }
}

float* get_heightmap() { return heightmap; }

int fib(int n) {
  if (n <= 1) return n;
  int a = 0, b = 1;
  for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
  return b;
}

int is_prime(int n) {
  if (n < 2) return 0;
  if (n == 2) return 1;
  if (n % 2 == 0) return 0;
  for (int i = 3; i * i <= n; i += 2) if (n % i == 0) return 0;
  return 1;
}

int count_primes(int n) {
  int c = 0;
  for (int i = 2; i <= n; i++) { int p = 1; for (int j = 2; j * j <= i; j++) { if (i % j == 0) { p = 0; break; } } if (p) c++; }
  return c;
}

int factorial(int n) {
  int r = 1;
  for (int i = 2; i <= n; i++) r *= i;
  return r;
}

}
