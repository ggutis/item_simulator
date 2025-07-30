import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/** 아이템 생성 API (변경된 DB 구조 반영) **/
router.post('/items', async (req, res, next) => {
  try {
    const {
      item_code,
      item_name,
      item_price,
      item_stat,
      item_type,
      description,
      rarity,
    } = req.body;

    // 1. 필수 데이터 유효성 검사
    if (!item_code || !item_name || item_price === undefined || !item_stat || !item_type || !rarity) {
      return res.status(400).json({ message: 'item_code, item_name, item_price, item_stat, item_type, rarity는 필수 입력 항목입니다.' });
    }

    // 2. item_stat이 유효한 JSON 객체인지 확인
    if (typeof item_stat !== 'object' || item_stat === null) {
        return res.status(400).json({ message: 'item_stat은 유효한 JSON 객체여야 합니다.' });
    }

    // 3. rarity 유효성 검사 (common, rare, epic, legendary)
    const validRarities = ['common', 'rare', 'epic', 'legendary'];
    if (!validRarities.includes(rarity.toLowerCase())) {
      return res.status(400).json({ message: `rarity는 다음 중 하나여야 합니다: ${validRarities.join(', ')}` });
    }

    // 4. 아이템 생성
    const newItem = await prisma.items.create({
      data: {
        item_code: +item_code, // item_code는 Int 타입이므로 숫자로 변환
        item_name,
        item_price: +item_price, // item_price는 Int 타입이므로 숫자로 변환
        item_stat, // item_stat은 JSON 타입
        item_type,
        description,
        rarity: rarity.toLowerCase(),
      },
    });

    return res.status(201).json({ message: '아이템이 성공적으로 생성되었습니다.', data: newItem });

  } catch (error) {
    // 데이터베이스 제약 조건 위반 (예: item_code 중복)
    if (error.code === 'P2002') {
        // P2002 에러의 meta.target을 통해 어떤 필드가 중복되었는지 확인할 수 있습니다.
        return res.status(409).json({ message: `이미 존재하는 item_code 입니다.` });
    }
    // 그 외의 오류는 중앙 에러 핸들러로 전달
    next(error);
  }
});

export default router;