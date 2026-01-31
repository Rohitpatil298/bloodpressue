import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Ruler, Weight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BasicUserDetails {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
}

interface UserDetailsFormProps {
  onSubmit: (details: BasicUserDetails) => void;
}

export function UserDetailsForm({ onSubmit }: UserDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    height: '',
    weight: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age < 18 || age > 120) {
      newErrors.age = 'Age must be between 18-120';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    const height = parseFloat(formData.height);
    if (!formData.height) {
      newErrors.height = 'Height is required';
    } else if (isNaN(height) || height < 100 || height > 250) {
      newErrors.height = 'Height must be 100-250 cm';
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(weight) || weight < 30 || weight > 300) {
      newErrors.weight = 'Weight must be 30-300 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender as 'male' | 'female' | 'other',
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
      });
    }
  };

  const isValid = formData.name && formData.age && formData.gender && formData.height && formData.weight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full wellness-gradient flex items-center justify-center wellness-glow"
          >
            <User className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-foreground">Your Details</h2>
          <p className="text-muted-foreground mt-2">Enter your information for personalized analysis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-primary" />
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`bg-background/50 border-border focus:ring-2 focus:ring-primary/20 ${
                errors.name ? 'border-destructive' : ''
              }`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                Age
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Years"
                min="18"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className={`bg-background/50 border-border ${errors.age ? 'border-destructive' : ''}`}
              />
              {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'male' | 'female' | 'other') =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger className={`bg-background/50 border-border ${errors.gender ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2 text-foreground">
                <Ruler className="w-4 h-4 text-primary" />
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                min="100"
                max="250"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className={`bg-background/50 border-border ${errors.height ? 'border-destructive' : ''}`}
              />
              {errors.height && <p className="text-xs text-destructive">{errors.height}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2 text-foreground">
                <Weight className="w-4 h-4 text-primary" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                min="30"
                max="300"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className={`bg-background/50 border-border ${errors.weight ? 'border-destructive' : ''}`}
              />
              {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full h-12 wellness-gradient text-primary-foreground font-semibold text-base gap-2 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
