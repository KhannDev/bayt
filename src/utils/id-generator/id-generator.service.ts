import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class IdGeneratorService {
  private cumtomNano6: () => string;
  private cumtomNano4: () => string;
  private cumtomNano2: () => string;
  private cumtomNum4: () => string;

  constructor() {
    // this.cumtomNano6 = customAlphabet(
    //   'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
    //   6,
    // );
    this.cumtomNano4 = customAlphabet(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      4,
    );
    this.cumtomNano2 = customAlphabet(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      2,
    );
    this.cumtomNum4 = customAlphabet('1234567890', 4);
  }

  generateReferal(prefix: string): string {
    return prefix + '-' + this.cumtomNano4() + '-' + this.cumtomNano2();
  }
  generateOtp(): string {
    return this.cumtomNum4();
  }
}
