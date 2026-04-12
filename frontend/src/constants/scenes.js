/**
 * Scene membership map — used by WorldView to group objects into tabs
 */
export const SCENE_MEMBERSHIP = {
  door_001:      'the_first_room',
  chest_001:     'the_first_room',
  key_001:       'the_first_room',
  tome_001:      'the_first_room',
  sage_001:      'the_first_room',
  mirror_001:    'the_first_room',
  cursed_door:   'the_sealed_chamber',
  tome_002:      'the_sealed_chamber',
  warlock_001:   'the_sealed_chamber',
  pedestal_001:  'the_sealed_chamber',
  tome_sealed:   'the_sealed_chamber',
  tome_003:      'the_archive',
  tome_004:      'the_archive',
  tome_005:      'the_archive',
  mirror_002:    'the_archive',
  librarian_001: 'the_archive',
};

export const SCENE_LABELS = {
  the_first_room:     '第一の間',
  the_sealed_chamber: '封印の間',
  the_archive:        '記録の間',
};

export const SCENE_DESCRIPTIONS = {
  the_first_room:     '入門の部屋。まずはオブジェクトと対話することを学ぼう。',
  the_sealed_chamber: '呪いに閉ざされた部屋。通常の手段では突破できない。',
  the_archive:        '知識の書庫。Rubyの奥深い概念が記録されている。',
};
