import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
const prisma = new PrismaClient();
import { ensureAuthenticated} from '../../config/auth';

export default async function handler(req, res) {
    const token = req.query.token
    const verifyToken = await ensureAuthenticated(token)
    if(verifyToken === undefined || null){
        res.status(403).send({msg: 'Token is invalid or expired'})
    }else{
        res.status(200).send(verifyToken)
    }

}
  
  