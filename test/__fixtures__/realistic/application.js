/**
 * Application
 */

export default function application(route: string) {
  switch (route) {
    case '/browse':
      return import('./routes/browse');
    case '/edp':
      return import('./routes/edp');
    case '/mdp':
      return import('./routes/mdp');
    case '/search':
      return import('./routes/search');
  }
}
