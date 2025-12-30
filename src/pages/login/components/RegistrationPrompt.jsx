import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

export default function RegistrationPrompt() {
  const { signUp } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }

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

    if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      const { data, error } = await signUp(
        formData?.email,
        formData?.password,
        formData?.fullName,
        formData?.companyName
      );

      if (error) {
        setErrors({
          submit: error?.message || 'Une erreur est survenue lors de l\'inscription'
        });
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        setSuccessMessage(
          'Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer votre compte.'
        );
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          companyName: ''
        });
        setTimeout(() => {
          setShowSignUp(false);
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err) {
      setErrors({
        submit: 'Une erreur réseau est survenue. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!showSignUp) {
    return (
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas encore de compte ?{' '}
          <button
            onClick={() => setShowSignUp(true)}
            className="font-medium text-primary hover:text-primary/80 transition-smooth"
          >
            Créer un compte
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Créer un compte</h3>
        <button
          onClick={() => setShowSignUp(false)}
          className="text-muted-foreground hover:text-foreground transition-smooth"
          aria-label="Retour à la connexion"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start gap-3">
            <Icon name="CheckCircle2" size={20} color="#10b981" className="flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="fullName"
          label="Nom complet"
          placeholder="Jean Dupont"
          value={formData?.fullName}
          onChange={handleChange}
          error={errors?.fullName}
          required
          disabled={isLoading}
        />

        <Input
          type="text"
          name="companyName"
          label="Nom de la société (optionnel)"
          placeholder="Ma Société SARL"
          value={formData?.companyName}
          onChange={handleChange}
          disabled={isLoading}
        />

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

        <Input
          type="password"
          name="password"
          label="Mot de passe"
          placeholder="Au moins 8 caractères"
          value={formData?.password}
          onChange={handleChange}
          error={errors?.password}
          required
          disabled={isLoading}
        />

        <Input
          type="password"
          name="confirmPassword"
          label="Confirmer le mot de passe"
          placeholder="Retapez votre mot de passe"
          value={formData?.confirmPassword}
          onChange={handleChange}
          error={errors?.confirmPassword}
          required
          disabled={isLoading}
        />

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
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </Button>
      </form>
    </div>
  );
}