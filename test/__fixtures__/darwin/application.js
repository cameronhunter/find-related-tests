/**
 * Application
 */

export default function application(route: string) {
  switch (route) {
    case '/browse':
      return import('./routes/browse');
    case '/mdp':
      return import('./routes/mdp');
    case '/profileGate':
      return import('./routes/profileGate');
    case '/search':
      return import('./routes/search');
  }
}
