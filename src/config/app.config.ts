export const appConfig = () => ({
    port: process.env.PORT,
    mongodb: process.env.MONGODB,
    jwtSecret: process.env.JWT_SECRET,
});


