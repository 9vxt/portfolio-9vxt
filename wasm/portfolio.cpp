extern "C" {

unsigned long long fib(unsigned long long n) {
  if (n <= 1) return n;
  unsigned long long a = 0, b = 1;
  for (unsigned long long i = 2; i <= n; i++) {
    unsigned long long c = a + b;
    a = b;
    b = c;
  }
  return b;
}

int is_prime(unsigned long long n) {
  if (n < 2) return 0;
  if (n == 2) return 1;
  if (n % 2 == 0) return 0;
  for (unsigned long long i = 3; i * i <= n; i += 2) {
    if (n % i == 0) return 0;
  }
  return 1;
}

unsigned long long count_primes(unsigned long long n) {
  unsigned long long count = 0;
  for (unsigned long long i = 2; i <= n; i++) {
    int prime = 1;
    for (unsigned long long j = 2; j * j <= i; j++) {
      if (i % j == 0) { prime = 0; break; }
    }
    if (prime) count++;
  }
  return count;
}

unsigned long long factorial(unsigned int n) {
  unsigned long long r = 1;
  for (unsigned int i = 2; i <= n; i++) r *= i;
  return r;
}

}
