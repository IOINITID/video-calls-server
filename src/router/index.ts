import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers';
import { isAuthorizated } from '../middlewares';

const router = Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  userController.registration
);

router.post('/authorization', userController.authorization);

router.post('/logout', userController.logout);

router.get('/activate/:link', userController.activate);

router.get('/refresh', userController.refresh);

router.get('/users', isAuthorizated, userController.getUsers);

export const defaultRouter = router;
