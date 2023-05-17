import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

export class HashManager {
    public hash = async (plaintext: string) => { // gerar hash
        const rounds = Number(process.env.BCRYPT_COST) // segurança
        const salt = await bcrypt.genSalt(rounds) // quantidade
        const hash = await bcrypt.hash(plaintext, salt)

        return hash
    }

    // verificar se está correto
    public compare = async (plaintext: string, hash: string) => {
				return bcrypt.compare(plaintext, hash)
    }
}