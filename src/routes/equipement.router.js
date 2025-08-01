import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 캐릭터 아이템 장착 api */
router.post('/character/:characterId/equip', authMiddleware, async (req, res, next) => {
    try {
        const { characterId } = req.params;
        const { item_code } = req.body;
        const { accountId } = req.user;

        if (!item_code) {
            return res.status(400).json({ message: '장착할 아이템의 code를 입력해 주세요.' });
        }

        const result = await prisma.$transaction(async (tx) => {
            //1.캐릭터가 내 소유인지 확인
            const character = await tx.character.findUnique({
                where: { characterId: +characterId },
            });

            if (!character || character.accountId !== accountId) {
                throw new Error('캐릭터를 찾을 수 없습니다.');
            }

            //2. 인벤토리에 아이템이 있는지 확인
            const inventoryItem = await tx.inventory.findFirst({
                where: { characterId: +characterId, item_code: +item_code },
            });

            if (!inventoryItem) {
                throw new Error('인벤토리에 해당 아이템이 존재하지 않습니다.');
            }

            //3. 이미 장착한 아이템인지 확인
            const alreadyEquipped = await tx.characterItems.findFirst({
                where: { characterId: +characterId, item_code: +item_code },
            });

            if (alreadyEquipped) {
                throw new Error(' 이미 장착한 아이템입니다.');
                
            }

            //4. 아이템 정보 조회(스탯 확인)
            const itemEqip = await tx.items.findUnique({
                where: { item_code: +item_code },
            });

            if (!itemEqip) {
                throw new Error('아이템 정보를 찾을 수 없습니다.');
            }

            //5. 아이템 장착
            await tx.characterItems.create({
                data: { characterId: +characterId, item_code: +item_code },
            });

            // 6. 인벤토리에서 아이템 수량 1감소
            const updatedInventory = await tx.inventory.update({
                where: { invenId: inventoryItem.invenId },
                data: {
                    count: {
                        decrement: 1,
                    },
                },
            });

            //7. 인벤토리 수량이 0이되면 삭제
            if (updatedInventory.count === 0) {
                await tx.inventory.delete({
                    where: { invenId: updatedInventory.invenId },
                });
            }

            //8. 캐릭터 스탯 업데이트
            const updatedCharacter = await tx.character.update({
                where: { characterId: +characterId },
                data: {
                    attack: {
                        increment: itemEqip.item_stat.attack || 0,
                    },
                    defense: {
                        increment: itemEqip.item_stat.defense || 0,
                    },
                    dexterity: {
                        increment: itemEqip.item_stat.dexterity || 0,
                    },
                    speed: {
                        increment: itemEqip.item_stat.speed || 0,
                    },
                    mp: {
                        increment: itemEqip.item_stat.mp || 0,
                    },
                    hp: {
                        increment: itemEqip.item_stat.hp || 0,
                    },
                },
            });

            return res.status(200).json({
                message: '아이템을 장착했습니다.',
                data: {
                    characterId: updatedCharacter.characterId,
                    attack: updatedCharacter.attack,
                    defense: updatedCharacter.defense,
                    dexterity: updatedCharacter.dexterity,
                    speed: updatedCharacter.speed,
                    mp: updatedCharacter.mp,
                    hp: updatedCharacter.hp,
                },
            });
        });
    } catch (error) {
        console.error('아이템 장착 오류:', error);

        if (error.message.includes('캐릭터를') || error.message.includes('인벤토리에') || error.message.includes('아이템')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('이미 장착한')) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: '서버오류가 발생했습니다.' });
    }
});

// - 아이템을 장착할 내 캐릭터의 ID를 URI의 **parameter**로 전달 받기
// - 탈착할 아이템 코드를 **request**에서 전달 받기
//     - 이 때, 장착 되지 않은 아이템을 탈착하려고 하면 장착 되어있지 않은 아이템이라고 탈착이 거부되어야 합니다!
// - **매우 중요: 아이템 탈착을 하게 되면 캐릭터의 스탯이 떨어져야 합니다!**
//     - 아이템 탈착에 성공하면 기존 캐릭터의 스탯을 직접적으로 변경해주도록 해요.
//     - 예시
//         - BEFORE.
//             - 캐릭터 스탯: { health: 520, power: 102 }
//         - “파멸의 반지”를 탈착!
//         - AFTER.
//             - 캐릭터 스탯: { health: **500**, power: **100** }
//     - 캐릭터 조회 API를 사용할 때 변경된 캐릭터 스탯으로 나타나야겠죠?
// - 또한, 캐릭터-아이템 테이블에서 해당 아이템 정보를 삭제해야 됩니다.
// - 그리고, 캐릭터-인벤토리 테이블에서 해당 아이템 정보는 변경 혹은 추가가 되어야겠죠.
//     - 인벤토리에 존재하지 않은 아이템을 탈착시에는 아이템 정보를 추가
//     - n(n ≥ 1)개 이상 있던 아이템을 탈착시에는 아이템 개수를 n+1 개로 변경

// router.delete('/character/:characterId/detach', authMiddleware, async(req, res, next)=>{
//     try{
//         const {characterId} = req.params;
//         const { itemId } = req.body;
//     }
// })

export default router;