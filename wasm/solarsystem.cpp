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
public:
  SolarSystem() : count(0) {}
  void add(float px, float py, float vx, float vy, float m, float rad, float cr, float cg, float cb) {
    if (count >= 32) return;
    planets[count++] = Planet(px, py, vx, vy, m, rad, cr, cg, cb);
  }
  void step(float dt) {
    const float G = 10.0f;
    for (int i = 0; i < count; i++) {
      Vec2 acc;
      for (int j = 0; j < count; j++) {
        if (i == j) continue;
        Vec2 diff = planets[j].pos - planets[i].pos;
        float dist = diff.length();
        if (dist < 0.01f) continue;
        float force = G * planets[j].mass / (dist * dist);
        acc = acc + Vec2(diff.x / dist * force, diff.y / dist * force);
      }
      planets[i].vel = planets[i].vel + acc * dt;
      planets[i].pos = planets[i].pos + planets[i].vel * dt;
    }
  }
  int getCount() const { return count; }
  float getX(int i) const { return i < count ? planets[i].pos.x : 0; }
  float getY(int i) const { return i < count ? planets[i].pos.y : 0; }
  float getVelX(int i) const { return i < count ? planets[i].vel.x : 0; }
  float getVelY(int i) const { return i < count ? planets[i].vel.y : 0; }
  float getRadius(int i) const { return i < count ? planets[i].radius : 0; }
  float getMass(int i) const { return i < count ? planets[i].mass : 0; }
  float getRed(int i) const { return i < count ? planets[i].r : 0; }
  float getGreen(int i) const { return i < count ? planets[i].g : 0; }
  float getBlue(int i) const { return i < count ? planets[i].b : 0; }
};

static SolarSystem sys;

extern "C" {
  void init_solar() {
    sys = SolarSystem();
    sys.add(0, 0, 0, 0, 5000, 0.35, 1.0, 0.8, 0.2);     // Sun
    sys.add(0.5, 0, 0, 4.5, 0.3, 0.03, 0.7, 0.7, 0.7);    // Mercury
    sys.add(0.8, 0, 0, 3.5, 0.8, 0.06, 0.9, 0.7, 0.3);     // Venus
    sys.add(1.1, 0, 0, 3.0, 1.0, 0.08, 0.2, 0.5, 1.0);     // Earth
    sys.add(1.4, 0, 0, 2.7, 0.6, 0.055, 1.0, 0.3, 0.2);    // Mars
    sys.add(1.9, 0, 0, 2.1, 2.0, 0.15, 0.8, 0.6, 0.4);     // Jupiter
    sys.add(2.4, 0, 0, 1.9, 1.5, 0.12, 0.9, 0.8, 0.6);     // Saturn
    sys.add(3.0, 0, 0, 1.65, 0.9, 0.09, 0.5, 0.7, 0.9);    // Uranus
    sys.add(3.6, 0, 0, 1.5, 0.8, 0.085, 0.4, 0.4, 0.9);    // Neptune
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
