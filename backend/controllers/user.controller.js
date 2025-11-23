import User from "../model/user.model.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userRegister = async (req, res) => {
    try {
        const {fullname,email,password,agreeTerm} = req.body
        const userExist = await User.findOne({
            where:{email}
        })

        if (userExist) {
            return res.status(400).json({
                success: false,
                message: 'User already exist'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            agreeTerm,
            role: 'user'
        })

        return res.status(201).json({
            success: true,
            message: 'User registered Successfully',
            data: user
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server failed to register user'
        })
    }
}

const userLogin = async (req, res) => {
    try {
        const { email,password } = req.body
        const userExist = await User.findOne({
            where: {
                email
            },
            attributes: ['id','email','password','role']
        })
        if (!userExist) {
            return res.status(404).json({
                success: false,
                message: 'User doesnot exist'
            })
        }

        const isMatch = await bcrypt.compare(password, userExist.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        const token = jwt.sign(
            {
                id: userExist.id,
                email: userExist.email,
                role: userExist.role
            },
            process.env.TOKEN_SECRET,
            {
                expiresIn: '1h'
            }
        )

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(Date.now() + 3600000)
        })

        return res.status(200).json({
            success: true,
            message: 'Login Successful',
            data: {
                userExist,
                token
            }
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server failed: Login'
        })
    }
}

export {
    userRegister,
    userLogin
}