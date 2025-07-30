import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

export default async function (req, res, next) {
  try {
    // 1. 클라이언트로부터 토큰을 전달받습니다.
    const { authorization } = req.cookies;
    if (!authorization) throw new Error('토큰이 존재하지 않습니다.');

    // 토큰의 인증방식이 Bearer 타입인지 확인합니다.
    const [tokenType, token] = authorization.split(' ');

    if (tokenType !== 'Bearer')
      throw new Error('토큰 타입이 일치하지 않습니다.');

    // 2. 서버에서 발급한 JWT가 맞는지 검증합니다.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const accountId = decodedToken.accountId;

     const user = await prisma.accounts.findFirst({
      where: { accountId: accountId },
    }); 
    
    if (!user) {
      res.clearCookie('authorization');
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }


    // 3. 토큰에 있는 accountId를 이용해 사용자를 조회합니다.
   

    if (!user) {
      res.clearCookie('authorization')
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    // 4. req.user에 조회된 사용자 정보를 할당합니다.
    req.user = user;

    next();
  } catch (error) {
    // 토큰 검증 실패 시, 에러 메시지를 클라이언트에게 전달합니다.
    switch (error.name) {
        case 'TokenExpiredError':
            return res.status(401).json({ message: '인증 정보가 만료되었습니다.' });
        case 'JsonWebTokenError':
            return res.status(401).json({ message: '인증 정보가 유효하지 않습니다.' });
        default:
          res.clearCookie('authorization');
            return res.status(401).json({ message: error.message ?? '비정상적인 요청입니다.' });
    }
  }
}
