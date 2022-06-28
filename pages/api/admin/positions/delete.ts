import { prisma } from "../../../../services/Prisma";

export default async function handler(req, res) {
    try{
      await prisma.position.delete({
        where: {
          id: req.query.id 
        }
      })
      await prisma.$disconnect();
      res.status(200).json({msg: `Position Deleted successfully`});
    }  
    catch(err){
      console.log(err)
      res.status(404).json({msg: `Update Request Failed`});
    } 
      }
      