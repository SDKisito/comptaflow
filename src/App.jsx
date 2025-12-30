import Routes from "./Routes";
import { StripeProvider } from './contexts/StripeContext';
import { AuthProvider } from './contexts/AuthContext';


function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        <Routes />
      </StripeProvider>
    </AuthProvider>
  );
}

export default App;