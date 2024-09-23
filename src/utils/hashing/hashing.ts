import { Injectable } from '@nestjs/common';
import { scrypt, randomBytes, createHmac } from 'crypto';
import { promisify } from 'util';

// @Injectable()
export class HashingService {
  private scryptAsync = promisify(scrypt);

  /**
   * toHash - hashes the password with salt
   * @param password string
   * @returns {Promise<string>}
   */
  async toHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const buf = (await this.scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  /**
   * compare - compares the supplied password with the stored password
   * @param storedPassword string
   * @param suppliedPassword string
   * @returns {Promise<boolean>}
   */

  async compare(
    storedPassword: string,
    suppliedPassword: string,
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.toString().split('.');
    const buf = (await this.scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    console.log(buf.toString('hex'));
    console.log(hashedPassword);
    return buf.toString('hex') === hashedPassword;
  }

  /**
   * createHmac - creates a hmac for the data
   * @param data string
   * @param key string
   * @returns {string}
   */

  createHmac(data: string, key: string): string {
    const hmac = createHmac('sha256', key);
    hmac.update(data);
    return hmac.digest('hex');
  }
}
