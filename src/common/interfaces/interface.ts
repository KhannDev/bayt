// src/common/interfaces/custom.request.interface.ts
import { Request } from 'express';

export interface CustomRequest extends Request {
  customer?: any;
  partner?: any;
  admin?: any;
}
