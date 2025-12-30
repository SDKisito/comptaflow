import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'L\'adresse e-mail est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Veuillez entrer une adresse e-mail valide';
    }

    if (!formData?.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: e?.target?.checked
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);
      
      if (error) {
        setErrors({
          submit: error?.message || 'Une erreur est survenue lors de la connexion'
        });
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        if (formData?.rememberMe) {
          localStorage.setItem('rememberedEmail', formData?.email);
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setErrors({
        submit: 'Une erreur réseau est survenue. Veuillez réessayer.'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Credentials Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} color="#3b82f6" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Comptes de démonstration</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <p className="font-medium">Administrateur:</p>
                <p className="font-mono text-xs">admin@comptaflow.fr / Admin2024!</p>
              </div>
              <div>
                <p className="font-medium">Expert-Comptable:</p>
                <p className="font-mono text-xs">marie.dubois@comptaflow.fr / Compta2024!</p>
              </div>
              <div>
                <p className="font-medium">Utilisateur:</p>
                <p className="font-mono text-xs">user@example.fr / User2024!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          name="email"
          label="Adresse e-mail"
          placeholder="votre.email@exemple.fr"
          value={formData?.email}
          onChange={handleChange}
          error={errors?.email}
          required
          disabled={isLoading}
        />
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
            value={formData?.password}
            onChange={handleChange}
            error={errors?.password}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-smooth"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <Checkbox
            label="Se souvenir de moi"
            checked={formData?.rememberMe}
            onChange={handleCheckboxChange}
            disabled={isLoading}
          />
          <a
            href="#forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-smooth"
          >
            Mot de passe oublié ?
          </a>
        </div>
        {errors?.submit && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={20} color="var(--color-destructive)" className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errors?.submit}</p>
            </div>
          </div>
        )}
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Connexion en cours...' : 'Se Connecter'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;