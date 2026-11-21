/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@f12da458a90f353a86c953f204304d5a8bd98275/';

function mapMuscle(m) {
  if (!m) return 'full_body';
  const s = String(m).toLowerCase();
  if (s.includes('pectoral') || s.includes('chest')) return 'chest';
  if (s.includes('latissimus') || s.includes('back') || s.includes('rhomboid') || s.includes('trap')) return 'back';
  if (s.includes('quad')) return 'quadriceps';
  if (s.includes('hamstring')) return 'hamstrings';
  if (s.includes('glute') || s.includes('hip')) return 'glutes';
  if (s.includes('deltoid') || s.includes('shoulder')) return 'shoulders';
  if (s.includes('bicep') || s.includes('tricep') || s.includes('arm') || s.includes('brachii')) return 'arms';
  if (s.includes('ab') || s.includes('oblique') || s.includes('core') || s.includes('spinae')) return 'core';
  return 'full_body';
}

function mapCategory(eq, cat) {
  if (cat === 'cardio') return 'cardio';
  if (cat === 'stretching') return 'mobility';
  if (cat === 'olympic') return 'barbell';
  if (!eq) return 'bodyweight';
  const e = String(eq).toLowerCase();
  if (e.includes('barbell') || e.includes('ez_bar') || e.includes('trap_bar')) return 'barbell';
  if (e.includes('dumbbell') || e.includes('kettlebell')) return 'dumbbell';
  if (e.includes('cable')) return 'cable';
  if (e.includes('machine') || e.includes('sled') || e.includes('hack') || e.includes('press') || e.includes('extension') || e.includes('curl')) return 'machine';
  if (e.includes('bike') || e.includes('treadmill') || e.includes('rower') || e.includes('elliptical') || e.includes('rope')) return 'cardio';
  return 'bodyweight';
}

function mapTrackingMethod(e, category) {
  const name = String(e.name_en || '').toLowerCase();
  if (category === 'cardio' || ['treadmill', 'bicycle', 'stationary_bike', 'air_bike', 'rower', 'elliptical'].includes(e.equipment)) {
    return 'distance_duration';
  }
  if (e.force_type === 'static' || category === 'mobility' || name.includes('plank') || name.includes('hold') || name.includes('stretch') || name.includes('wall sit')) {
    return 'isometric';
  }
  if (e.is_bodyweight) {
    if (name.includes('pull-up') || name.includes('chin-up') || name.includes('dip')) {
      return 'weight_reps';
    }
    return 'bodyweight_reps';
  }
  return 'weight_reps';
}

async function run() {
  console.log('Fetching RepDB dataset from GitHub...');
  const res = await fetch('https://raw.githubusercontent.com/RepDB/exercise-dataset/f12da458a90f353a86c953f204304d5a8bd98275/exercises.json');
  const data = await res.json();
  const rawList = data.exercises;
  console.log('Ingesting', rawList.length, 'exercises...');

  const indexList = [];
  const detailsMap = {};

  for (const r of rawList) {
    const cat = mapCategory(r.equipment, r.category);
    const tracking = mapTrackingMethod(r, cat);
    const primaryM = mapMuscle(r.primary_muscles && r.primary_muscles[0]);
    const secondaryM = (r.secondary_muscles || []).map(mapMuscle).filter(m => m !== primaryM);

    const flatImgs = (r.images && r.images.flat) || {};
    const startImg = flatImgs.start || flatImgs.main;
    const peakImg = flatImgs.peak;
    const mainImg = flatImgs.main || flatImgs.start;

    const coachProId = 'ex-repdb-' + r.id;
    const cleanEquip = r.equipment ? String(r.equipment).replace(/_/g, ' ') : 'Bodyweight';

    const indexItem = {
      id: coachProId,
      source: 'repdb',
      sourceId: r.id,
      name: r.name_en,
      nameDe: r.name_de || undefined,
      nameEs: r.name_es || undefined,
      category: cat,
      primaryMuscle: primaryM,
      secondaryMuscles: secondaryM,
      equipment: cleanEquip,
      difficulty: r.difficulty || 'intermediate',
      trackingMethod: tracking,
      isBodyweight: Boolean(r.is_bodyweight),
      isUnilateral: Boolean(r.is_unilateral),
      hasIllustration: Boolean(startImg || mainImg),
      thumbUrl: startImg ? CDN_BASE + startImg : undefined
    };
    indexList.push(indexItem);

    detailsMap[coachProId] = {
      ...indexItem,
      description: r.description_en || '',
      descriptionDe: r.description_de || '',
      descriptionEs: r.description_es || '',
      instructions: r.instructions_en || [],
      instructionsDe: r.instructions_de || [],
      instructionsEs: r.instructions_es || [],
      tips: r.tips_en || [],
      tipsDe: r.tips_de || [],
      tipsEs: r.tips_es || [],
      forceType: r.force_type,
      mechanic: r.mechanic,
      goals: r.goals || [],
      tags: r.tags || [],
      met: r.met,
      images: {
        start: startImg ? CDN_BASE + startImg : undefined,
        peak: peakImg ? CDN_BASE + peakImg : undefined,
        main: mainImg ? CDN_BASE + mainImg : undefined
      }
    };
  }

  const outDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const indexPath = path.join(outDir, 'exercises-index.json');
  const detailsPath = path.join(outDir, 'exercises-details.json');

  fs.writeFileSync(indexPath, JSON.stringify(indexList));
  fs.writeFileSync(detailsPath, JSON.stringify(detailsMap));

  const indexKb = Math.round(fs.statSync(indexPath).size / 1024);
  const detailsKb = Math.round(fs.statSync(detailsPath).size / 1024);

  console.log('✓ Successfully generated:');
  console.log('  -', indexPath, `(${indexKb} KB search index, ${indexList.length} items)`);
  console.log('  -', detailsPath, `(${detailsKb} KB details lookup)`);
}

run().catch(console.error);
