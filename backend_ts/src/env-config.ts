// const e_vars = {
//   	port: process.env.PORT || 8080,
// 	pepper: process.env.PEPPER,
// 	jwt_secret: process.env.JWT_SECRET,
// };

// export default e_vars;

export const pepper = process.env.PEPPER;
export const jwt_secret = process.env.JWT_SECRET;
export const fe_ip_address = process.env.FE_IP_ADDRESS || 'http://localhost:3000';