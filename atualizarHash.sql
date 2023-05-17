-- Active: 1683853889799@@127.0.0.1@3306

-- atualizar senhas para hashes bcrypt
-- (NÃO RODAR ANTES DA PRÁTICA 3 SER FINALIZADA)

UPDATE users
SET password = "$2y$12$CPAhYAV4iw10KgOqh.MnwOps6ADbWlqA/20eJ2L.ZTClwNhiQgqi2"
WHERE name = "Igor";
-- plaintext = igor123

UPDATE users
SET password = "$2y$12$swzYA2HACTptC0F.jTjNLuw6riTSBuGp.dmNEM28Xkjz2RFu7JDe2"
WHERE name = "Hugo";
-- plaintext = hugo00

UPDATE users
SET password = "$2y$12$83p07pXDpfVybJuzEdGo9u0qc/rlGGkAZ0y4b3rk47DFFnu4tV6k2"
WHERE name = "Vanessa";
-- plaintext = vanessa99
