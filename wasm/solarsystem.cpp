struct Vec2 {
  float x, y;
  Vec2() : x(0), y(0) {}
  Vec2(float x, float y) : x(x), y(y) {}
  Vec2 operator+(const Vec2& v) const { return Vec2(x+v.x, y+v.y); }
  Vec2 operator-(const Vec2& v) const { return Vec2(x-v.x, y-v.y); }
  Vec2 operator*(float s) const { return Vec2(x*s, y*s); }
  Vec2& operator+=(const Vec2& v) { x+=v.x; y+=v.y; return *this; }
  float length() const {
    float a = x*x + y*y;
    if (a < 0.0001f) return 0;
    float r = a;
    for (int i = 0; i < 6; i++) r = (r + a/r) * 0.5f;
    return r;
  }
  static float sqrtf(float a) {
    if (a <= 0) return 0;
    float r = a;
    for (int i = 0; i < 6; i++) r = (r + a/r) * 0.5f;
    return r;
  }
};

struct PlanetGPUData {
  float px, py;       // vec2f   offset  0  — pos
  float vx, vy;       // vec2f   offset  8  — _vel (unused in shader)
  float mass;          // f32     offset 16
  float radius;        // f32     offset 20
  float _pad1, _pad2;  // vec2f   offset 24  — padding
  float r, g, b;       // vec3f   offset 32  — color (align 16)
  float _pad3;         // f32     offset 44
}; // total 48 bytes = 12 floats, align 16

class SolarSystem {
  PlanetGPUData planets[32];
  int count;
  static constexpr float G = 1.0f;
public:
  SolarSystem() : count(0) {}

  void add(float px, float py, float vx, float vy, float m, float rad, float cr, float cg, float cb) {
    if (count >= 32) return;
    planets[count].px = px; planets[count].py = py;
    planets[count].vx = vx; planets[count].vy = vy;
    planets[count].mass = m;
    planets[count].radius = rad;
    planets[count].r = cr; planets[count].g = cg; planets[count].b = cb;
    planets[count]._pad1 = 0; planets[count]._pad2 = 0; planets[count]._pad3 = 0;
    count++;
  }

  void step(float dt) {
    if (dt > 0.02f) dt = 0.02f;
    for (int i = 0; i < count; i++) {
      float ax = 0, ay = 0;
      for (int j = 0; j < count; j++) {
        if (i == j) continue;
        float dx = planets[j].px - planets[i].px;
        float dy = planets[j].py - planets[i].py;
        float dist = Vec2::sqrtf(dx*dx + dy*dy);
        float minDist = planets[i].radius + planets[j].radius;
        if (dist < minDist) dist = minDist;
        float force = G * planets[j].mass / (dist * dist + 0.01f);
        ax += dx / dist * force;
        ay += dy / dist * force;
      }
      planets[i].vx += ax * dt;
      planets[i].vy += ay * dt;
      planets[i].px += planets[i].vx * dt;
      planets[i].py += planets[i].vy * dt;
    }
  }

  int getCount() const { return count; }
  float getX(int i) const { return i < count ? planets[i].px : 0; }
  float getY(int i) const { return i < count ? planets[i].py : 0; }
  float getRadius(int i) const { return i < count ? planets[i].radius : 0; }
  float getMass(int i) const { return i < count ? planets[i].mass : 0; }
  float getRed(int i) const { return i < count ? planets[i].r : 0; }
  float getGreen(int i) const { return i < count ? planets[i].g : 0; }
  float getBlue(int i) const { return i < count ? planets[i].b : 0; }
  PlanetGPUData* getPtr() { return planets; }
};

static SolarSystem sys;

static float orbit_v(float r, float central_mass) {
  return Vec2::sqrtf(1.0f * central_mass / r);
}

struct PlanetInit { float x, radius, mass; float r, g, b; };

extern "C" {
  void init_solar() {
    sys = SolarSystem();
    const float M_SUN = 10.0f;
    sys.add(0, 0, 0, 0, M_SUN, 0.35f, 1.0f, 0.8f, 0.2f);
    PlanetInit data[8] = {
      {0.5f,  0.030f, 0.001f, 0.7f, 0.7f, 0.7f},
      {0.8f,  0.060f, 0.003f, 0.9f, 0.7f, 0.3f},
      {1.1f,  0.080f, 0.005f, 0.2f, 0.5f, 1.0f},
      {1.4f,  0.055f, 0.003f, 1.0f, 0.3f, 0.2f},
      {1.9f,  0.150f, 0.020f, 0.8f, 0.6f, 0.4f},
      {2.4f,  0.120f, 0.015f, 0.9f, 0.8f, 0.6f},
      {3.0f,  0.090f, 0.010f, 0.5f, 0.7f, 0.9f},
      {3.6f,  0.085f, 0.008f, 0.4f, 0.4f, 0.9f},
    };
    for (int i = 0; i < 8; i++) {
      float vy = orbit_v(data[i].x, M_SUN);
      sys.add(data[i].x, 0, 0, vy, data[i].mass, data[i].radius, data[i].r, data[i].g, data[i].b);
    }
  }

  void step_solar(float dt) { sys.step(dt); }

  int planet_count() { return sys.getCount(); }
  float planet_x(int i) { return sys.getX(i); }
  float planet_y(int i) { return sys.getY(i); }
  float planet_radius(int i) { return sys.getRadius(i); }
  float planet_r(int i) { return sys.getRed(i); }
  float planet_g(int i) { return sys.getGreen(i); }
  float planet_b(int i) { return sys.getBlue(i); }

  float* get_planets_ptr() { return &(sys.getPtr()->px); }
}
