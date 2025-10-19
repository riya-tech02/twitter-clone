import { Request, Response, NextFunction } from 'express';

const Joi = require('joi');

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail: any) => detail.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
      return;
    }

    next();
  };
};

// Validation schemas
export const signupSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
    }),
  displayName: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.max': 'Display name cannot exceed 50 characters',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const tweetSchema = Joi.object({
  content: Joi.string()
    .max(280)
    .required()
    .messages({
      'string.max': 'Tweet cannot exceed 280 characters',
    }),
  media: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid('image', 'video').required(),
        url: Joi.string().uri().required(),
      })
    )
    .max(4),
});

export const commentSchema = Joi.object({
  content: Joi.string()
    .max(280)
    .required()
    .messages({
      'string.max': 'Comment cannot exceed 280 characters',
    }),
});

export const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(1).max(50),
  bio: Joi.string().max(160),
});