const configuration = () => ({
  databaseURI: verifyEnv('MONGO_URI'),
  jwtsecret: verifyEnv('JWT_SECRET'),
  aws_s3_access_key: verifyEnv('AWS_S3_ACCESS_KEY_ID'),
  aws_s3_secret_access: verifyEnv('AWS_S3_SECRET_ACCESS_KEY'),
  // aws_s3_flaq_bucket: verifyEnv('AWS_S3_FLAQ_BUCKET'),
  node_env: verifyEnv('NODE_ENV'),
  expo_token: verifyEnv('EXPO_TOKEN'),

  smtp: {
    SMTP_HOST: verifyEnv('SMTP_HOST'),
    SMTP_PORT: verifyEnv('SMTP_PORT'),
    SMTP_EMAIL: verifyEnv('SMTP_EMAIL'),
    SMTP_PASSWORD: verifyEnv('SMTP_PASSWORD'),
    FROM_NAME: verifyEnv('FROM_NAME'),
    FROM_EMAIL: verifyEnv('FROM_EMAIL'),
  },
});
const verifyEnv = (key: string) => {
  const value = process.env[key];
  // console.log(value);

  return String(value);
};

export default configuration;
