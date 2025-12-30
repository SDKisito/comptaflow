import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import LoginForm from './components/LoginForm';
import TrustBadges from './components/TrustBadges';
import LanguageSelector from './components/LanguageSelector';
import RegistrationPrompt from './components/RegistrationPrompt';
import { trackAuth } from '../../utils/analytics';
import { supabase } from '../../lib/supabase';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const features = [
    {
      id: 1,
      icon: 'FileText',
      title: 'Facturation Intelligente',
      description: 'Créez et gérez vos factures en quelques clics avec des modèles personnalisables'
    },
    {
      id: 2,
      icon: 'BarChart3',
      title: 'Rapports Financiers',
      description: 'Visualisez vos performances avec des tableaux de bord en temps réel'
    },
    {
      id: 3,
      icon: 'FileCheck',
      title: 'Conformité Fiscale',
      description: 'Déclarations TVA et URSSAF automatisées conformes aux normes françaises'
    },
    {
      id: 4,
      icon: 'Users',
      title: 'Gestion Clients',
      description: 'Base de données complète pour suivre vos relations commerciales'
    }
  ];

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase?.auth?.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Track successful login
      trackAuth?.login('email');
      
      navigate('/dashboard');
    } catch (error) {
      setError(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase?.auth?.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
      
      // Track Google login attempt
      trackAuth?.login('google');
    } catch (error) {
      setError(error?.message);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <LanguageSelector />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="relative min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-8 lg:p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={28} color="var(--color-primary-foreground)" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-primary-foreground">
                ComptaFlow
              </h1>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary-foreground mb-4">
                  Simplifiez votre comptabilité d'entreprise
                </h2>
                <p className="text-lg text-primary-foreground/90">
                  La solution complète pour gérer votre comptabilité, facturation et conformité fiscale en toute sérénité
                </p>
              </div>

              <div className="grid gap-6">
                {features?.map((feature) => (
                  <div key={feature?.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                      <Icon name={feature?.icon} size={20} color="var(--color-primary-foreground)" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary-foreground mb-1">
                        {feature?.title}
                      </h3>
                      <p className="text-sm text-primary-foreground/80">
                        {feature?.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-primary-foreground/70">
            <span>&copy; {new Date()?.getFullYear()} ComptaFlow</span>
            <span>•</span>
            <a href="#privacy" className="hover:text-primary-foreground transition-smooth">
              Confidentialité
            </a>
            <span>•</span>
            <a href="#terms" className="hover:text-primary-foreground transition-smooth">
              Conditions
            </a>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} color="var(--color-primary-foreground)" />
                </div>
                <h1 className="text-xl font-heading font-bold text-foreground">
                  ComptaFlow
                </h1>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-elevation-2 p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  Connexion
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Accédez à votre espace de gestion comptable
                </p>
              </div>

              <LoginForm />

              <RegistrationPrompt />
            </div>

            <TrustBadges />

            <div className="mt-8 text-center text-xs text-muted-foreground">
              <p>
                En vous connectant, vous acceptez nos{' '}
                <a href="#terms" className="text-primary hover:text-primary/80 transition-smooth">
                  conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#privacy" className="text-primary hover:text-primary/80 transition-smooth">
                  politique de confidentialité
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;