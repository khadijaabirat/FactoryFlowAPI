/**
 * Script de synchronisation automatique entre Git / GitHub et Jira
 * Usage: node scripts/sync-jira-git.js <JIRA_KEY> [custom_message]
 * Exemple: node scripts/sync-jira-git.js FA-38
 */

const https = require('https');
const { execSync } = require('child_process');

const EMAIL = 'abiratkhadija@gmail.com';
const TOKEN = 'ATATT3xFfGF00pnk6pGwND_OAlI8DajQhQKylYUgIMSXgCvHGXhmFazYmNKEXEYXIzg8nVEkTNhqIDl_VdcD5iHQbka-zsXtX2Tr1JC5y-6_v4UB8hTzcqayCJKrGAUgfVwhicn4g4AuvlHtV6RyiLSbgJMqUiD0uo_tZI3GL07mGqHD01Zn5jY=E38E7457';
const JIRA_DOMAIN = 'abiratkhadija-1788780331877.atlassian.net';
const AUTH = Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

function jiraRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: JIRA_DOMAIN,
      path,
      method,
      headers: {
        'Authorization': `Basic ${AUTH}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : null);
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`Jira API Error [${res.statusCode}]: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getIssue(key) {
  return await jiraRequest(`/rest/api/3/issue/${key}`);
}

async function transitionIssue(key, transitionId = '31') {
  return await jiraRequest(`/rest/api/3/issue/${key}/transitions`, 'POST', {
    transition: { id: transitionId }
  });
}

function getPrefix(summary) {
  const s = summary.toLowerCase();
  if (s.includes('auth') || s.includes('login') || s.includes('jwt') || s.includes('profil')) return 'feat(auth)';
  if (s.includes('install')) return 'feat(installation)';
  if (s.includes('user') || s.includes('utilisat')) return 'feat(users)';
  if (s.includes('matière') || s.includes('raw-material') || s.includes('stock')) return 'feat(stock)';
  if (s.includes('produit') || s.includes('bom') || s.includes('nomenclature')) return 'feat(products)';
  if (s.includes('fabrication') || s.includes('ordre') || s.includes('of')) return 'feat(production)';
  if (s.includes('test') || s.includes('jest')) return 'test';
  if (s.includes('doc') || s.includes('swagger')) return 'docs';
  return 'feat';
}

async function main() {
  const issueKey = process.argv[2];
  if (!issueKey) {
    console.error('❌ Erreur : Veuillez spécifier la clé Jira (ex: node scripts/sync-jira-git.js FA-38)');
    process.exit(1);
  }

  let summary = process.argv[3] || 'Mise à jour et implémentation';
  let parentKey = null;

  try {
    console.log(`\n🔍 Récupération des informations Jira pour ${issueKey}...`);
    const issue = await getIssue(issueKey);
    summary = issue.fields.summary;
    parentKey = issue.fields.parent ? issue.fields.parent.key : null;
    console.log(`📋 Tâche trouvée : [${issueKey}] ${summary}`);
  } catch (err) {
    console.log(`⚠️ Jira inaccessible (${err.message}). Utilisation du titre par défaut.`);
  }

  const statusOutput = execSync('git status --porcelain').toString().trim();
  if (statusOutput.length > 0) {
    console.log('\n📦 Fichiers modifiés détectés. Préparation du commit...');
    execSync('git add -A');
    const prefix = getPrefix(summary);
    const commitMsg = `${prefix}: ${issueKey} - ${summary}`;
    console.log(`💾 Commit: "${commitMsg}"`);
    execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    console.log('🚀 Push vers GitHub (origin/main)...');
    execSync('git push origin main');
    console.log('✅ Code pushé avec succès sur GitHub !');
  } else {
    console.log('\nℹ️ Aucun fichier modifié à commiter, mise à jour de Jira uniquement...');
  }

  try {
    console.log(`\n🔄 Passage de ${issueKey} à l'état "Terminé" sur Jira...`);
    await transitionIssue(issueKey, '31');
    console.log(`✅ ${issueKey} est maintenant marqué comme "Terminé" sur Jira !`);
  } catch (err) {
    console.log(`⚠️ Transition Jira ${issueKey} : ${err.message}`);
  }

  if (parentKey) {
    try {
      const parentIssue = await getIssue(parentKey);
      const subtasks = parentIssue.fields.subtasks || [];
      const allDone = subtasks.every(st => st.fields.status.name === 'Terminé' || st.key === issueKey);
      if (allDone) {
        console.log(`🎉 Toutes les sous-tâches sont terminées ! Passage de la tâche parente ${parentKey} à "Terminé"...`);
        await transitionIssue(parentKey, '31');
        console.log(`✅ Tâche parente ${parentKey} marquée comme "Terminé" !`);
      }
    } catch (err) {
      // Ignorer si la tâche parente est déjà terminée
    }
  }

  console.log('\n✨ Synchronisation terminée avec succès !\n');
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  process.exit(1);
});
