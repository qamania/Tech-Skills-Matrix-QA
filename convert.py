from jinja2 import Template
import os
import hashlib

LANGUAGES = ['en', 'uk']
DEFAULT_LANGUAGE = 'en'
TEMPLATE_BASE = 'templates'
MATRIX_BASE = 'matrix'
OUTPUT_BASE = 'web'
STATIC_PATH_DEFAULT = './'  # For default index.html
STATIC_PATH_LANG = '../'  # For language-specific subfolders index.html


def build_item_id(prefix, file_name, category_index, item_index, subitem_index=None):
    seed = [file_name, str(category_index), str(item_index)]
    if subitem_index is not None:
        seed.append(str(subitem_index))
    return prefix + hashlib.md5('|'.join(seed).encode('utf-8')).hexdigest()[:8]


def convert(file_path, num):
    with open(file_path, encoding='utf-8') as file_handle:
        lines = file_handle.readlines()

    data = {'category': {}}
    category = ''
    category_index = -1
    current_list = None
    file_name = os.path.basename(file_path)

    for line in lines:
        if line.startswith('# '):
            data['header'] = line.strip('#').strip()
            data['number'] = '0' + str(num)
        elif line.startswith('## '):
            category = line.strip('##').strip()
            category_index += 1
            data['category'][category] = []
            current_list = data['category'][category]
        elif line.startswith('- '):
            item_index = len(current_list)
            item_id = build_item_id('item_', file_name, category_index, item_index)
            current_list.append({
                'text': line.strip('-').strip(),
                'id': item_id,
                'subitems': []
            })
        elif line.startswith('  - '):
            if current_list:
                item_index = len(current_list) - 1
                subitem_index = len(current_list[-1]['subitems'])
                subitem_id = build_item_id(
                    'subitem_',
                    file_name,
                    category_index,
                    item_index,
                    subitem_index
                )
                current_list[-1]['subitems'].append({
                    'text': line.strip('  - ').strip(),
                    'id': subitem_id
                })
        else:
            data['description'] = line.strip()

    return data


def build_language_data(language):
    number = 1
    data = []
    matrix_dir = os.path.join(MATRIX_BASE, language)

    files = os.listdir(matrix_dir)
    files.sort()
    for file in files:
        if file.endswith('.md'):
            data.append(convert(os.path.join(matrix_dir, file), number))
            number += 1

    return data


def generate_html_for_language(language, output_path, static_path, data):
    template_path = os.path.join(TEMPLATE_BASE, language, 'template.html')
    template = Template(open(template_path, encoding='utf-8').read())
    levels = ((1, 'Trainee'), (2, 'Junior'), (3, 'Middle'), (4, 'Senior'), (5, 'Expert'))
    os.makedirs(output_path, exist_ok=True)
    output_file = os.path.join(output_path, 'index.html')
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(template.render(data=data, levels=levels, language=language, static_path=static_path))


if __name__ == '__main__':
    all_data = {lang: build_language_data(lang) for lang in LANGUAGES}

    for lang in LANGUAGES:
        generate_html_for_language(lang, os.path.join(OUTPUT_BASE, lang), STATIC_PATH_LANG, all_data[lang])
        if lang == DEFAULT_LANGUAGE:
            generate_html_for_language(lang, OUTPUT_BASE, STATIC_PATH_DEFAULT, all_data[lang])
