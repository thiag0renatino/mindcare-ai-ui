import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINTS = ['/auth/signin', '/auth/register', '/empresas'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => req.url.includes(endpoint));
  if (isPublic) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.token;
  if (!token) {
    return next(req);
  }

  const authorized = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(authorized);
};
