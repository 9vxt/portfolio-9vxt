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

class Planet {
public:
  Vec2 pos, vel;
  float mass, radius;
  float r, g, b;
  Planet() : mass(1), radius(0.1), r(1), g(1), b(1) {}
  Planet(float px, float py, float vx, float vy, float m, float rad, float cr, float cg, float cb)
    : pos(px, py), vel(vx, vy), mass(m), radius(rad), r(cr), g(cg), b(cb) {}
};

class SolarSystem {
  Planet planets[32];
  int count;
  static constexpr float G = 1.0f;
public:
  SolarSystem() : count(0) {}
  void add(float px, float py, float vx, float vy, float m, float rad, float cr, float cg, float cb) {
    if (count >= 32) return;
    planets[count++] = Planet(px, py, vx, vy, m, rad, cr, cg, cb);
  }
  void step(float dt) {
    if (dt > 0.02f) dt = 0.02f;
    for (int i = 0; i < count; i++) {
      Vec2 acc;
      for (int j = 0; j < count; j++) {
        if (i == j) continue;
        Vec2 diff = planets[j].pos - planets[i].pos;
        float dist = diff.length();
        float minDist = planets[i].radius + planets[j].radius;
        if (dist < minDist) dist = minDist;
        float force = G * planets[j].mass / (dist * dist + 0.01f);
        acc = acc + Vec2(diff.x / dist * force, diff.y / dist * force);
      }
      planets[i].vel = planets[i].vel + acc * dt;
      planets[i].pos = planets[i].pos + planets[i].vel * dt;
    }
  }
  int getCount() const { return count; }
  float getX(int i) const { return i < count ? planets[i].pos.x : 0; }
  float getY(int i) const { return i < count ? planets[i].pos.y : 0; }
  float getRadius(int i) const { return i < count ? planets[i].radius : 0; }
  float getMass(int i) const { return i < count ? planets[i].mass : 0; }
  float getRed(int i) const { return i < count ? planets[i].r : 0; }
  float getGreen(int i) const { return i < count ? planets[i].g : 0; }
  float getBlue(int i) const { return i < count ? planets[i].b : 0; }
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
  float planet_mass(int i) { return sys.getMass(i); }
}
