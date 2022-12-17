/**
 * Application
 */

export default function application(route: string) {
  switch (route) {
    case '/':
      return import('./routes/profiles');
    case '/browse':
      return import('./routes/browse');
    case '/details':
      return import('./routes/details');
    case '/search':
      return import('./routes/search');
  }
}
