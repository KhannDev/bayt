import { Injectable } from '@nestjs/common';
import { S3, SES } from 'aws-sdk';
import configuration from '../../common/configuration';
// import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

type AwsS3DirectUploadConfig = {
  ACL?: string;
  Bucket: string;
  Body: any;
  Key: string;
};

type AwsS3DirectDeleteConfig = {
  Bucket: string;
  Key: string;
};

type AwsS3DirectDownloadConfig = {
  Bucket: string;
  Key: string;
};

/**
 * AWS S3 Service
 * @class AwsS3Service
 * @description Contains all the related methods like upload, download, delete, etc.
 * @requires S3
 * @requires PinoLogger
 * @requires configuration
 */

@Injectable()
export class AwsS3Service {
  s3: S3;
  Ses: SES;

  constructor() {
    this.s3 = new S3({
      apiVersion: 'latest',
      accessKeyId: configuration().aws_s3_access_key,
      secretAccessKey: configuration().aws_s3_secret_access,
      signatureVersion: 'v4',
      region: 'me-south-1',
    });
  }

  /**
   * Get a signed url for the client to upload a file
   * @returns key and url
   */
  async getSignedUrl(fileName, fileExtension) {
    this.s3 = new S3({
      apiVersion: 'latest',
      accessKeyId: configuration().aws_s3_access_key,
      secretAccessKey: configuration().aws_s3_secret_access,
      signatureVersion: 'v4',
      region: 'me-south-1',
    });
    const key = `upload/${fileName}.${fileExtension}`;
    const params = {
      Bucket: 'handy-man-bucket',
      Key: key,
      Expires: 60 * 60,
      // ACL: 'public-read',
    };
    const url = await this.s3.getSignedUrl('putObject', params);
    // this.logger.info(`AWS getSignedUrl success ${url}`);

    console.log(url);
    return {
      key,
      url,
    };
  }
  /**
   * Send emails
   */
}
