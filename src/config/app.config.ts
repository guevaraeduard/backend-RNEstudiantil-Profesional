export const appConfig = () => ({
    port: process.env.PORT,
    mongodb: process.env.MONGODB,
    jwtSecret: process.env.JWT_SECRET,
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM,
    },
});


