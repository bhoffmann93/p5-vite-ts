#define HALF_PI 1.57079632679
#define PI 3.14159265359
#define TAU 6.28318530718
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_TAU 0.15915494309189535
#define EPSILON 1e-5 // 0.00001
#define eps32 1e-10
#define GOLDEN_ANGLE 2.39996322972865332
#define PHI 1.618033988749
#define PHI_CONJUGATE 0.61803398875

#define BLACK vec3(0.0)
#define GREY vec3(0.5)
#define DARK_GREY vec3(0.125)
#define LIGHT_GREY vec3(0.75)
#define WHITE vec3(1.0)
#define RED vec3(1.0, 0.0, 0.0)
#define GREEN vec3(0.0, 1.0, 0.0)
#define BLUE vec3(0.0, 0.0, 1.0)
#define CYAN vec3(0.0, 1.0, 1.0)
#define MAGENTA vec3(1.0, 0.0, 1.0)
#define YELLOW vec3(1.0, 1.0, 0.0)
#define ORANGE vec3(1.0, 0.5, 0.0)

//corners [-1,1]
const vec2 bottomLeft11 = vec2(-1.0, -1.0);
const vec2 bottomCenter11 = vec2(0.0, -1.0);
const vec2 bottomRight11 = vec2(1.0, -1.0);
const vec2 centerLeft11 = vec2(-1.0, 0.0);
const vec2 center11 = vec2(0.0, 0.0);
const vec2 centerRight11 = vec2(1.0, 0.0);
const vec2 topLeft11 = vec2(-1.0, 1.0);
const vec2 topCenter11 = vec2(0.0, 1.0);
const vec2 topRight11 = vec2(1.0, 1.0);

//corners [0,1]
const vec2 bottomLeft01 = vec2(0.0, 0.0);
const vec2 bottomCenter01 = vec2(0.5, 0.0);
const vec2 bottomRight01 = vec2(1.0, 0.0);
const vec2 centerLeft01 = vec2(0.0, 0.5);
const vec2 center01 = vec2(0.5, 0.5);
const vec2 centerRight01 = vec2(1.0, 0.5);
const vec2 topLeft01 = vec2(0.0, 1.0);
const vec2 topCenter01 = vec2(0.5, 1.0);
const vec2 topRight01 = vec2(1.0, 1.0);
