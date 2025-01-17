import jwt from "jsonwebtoken"

export default function middlewareAuth(req,res,next){
  const token=req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTKEY); 
    req.userid = decoded.userid; 
    next(); 
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

}