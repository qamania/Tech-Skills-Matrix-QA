from jinja2 import Template
import os

LANGUAGES = ['en', 'uk']
DEFAULT_LANGUAGE = 'en'
TEMPLATE_BASE = 'templates'
MATRIX_BASE = 'MATRIX'
OUTPUT_BASE = 'web'
STATIC_PATH_DEFAULT = './'  # For default index.html
STATIC_PATH_LANG = '../'  # For language-specific subfolders index.html


def convert(file, num):
    with open(file, encoding='utf-8') as file:  # Specify UTF-8 encoding
        lines = file.readlines()

    data = {'category': {}}
    category = ''
    current_list = None

    for line in lines:
        if line.startswith('# '):
            data['header'] = line.strip('#').strip()
            data['number'] = '0' + str(num)
        elif line.startswith('## '):
            category = line.strip('##').strip()
            data['category'][category] = []
            current_list = data['category'][category]
        elif line.startswith('- '):
            current_list.append({'text': line.strip('-').strip(), 'subitems': []})
        elif line.startswith('  - '):
            if current_list:
                current_list[-1]['subitems'].append(line.strip('  - ').strip())
        else:
            data['description'] = line.strip()

    return data


def generate_html_for_language(language, output_path, static_path):
    number = 1
    data = []
    matrix_dir = os.path.join(MATRIX_BASE, language)
    template_path = os.path.join(TEMPLATE_BASE, language, 'template.html')

    files = os.listdir(matrix_dir)
    files.sort()
    for file in files:
        if file.endswith('.md'):
            data.append(convert(os.path.join(matrix_dir, file), number))
            number += 1

    template = Template(open(template_path, encoding='utf-8').read())
    levels = ((1, 'Trainee'), (2, 'Junior'), (3, 'Middle'), (4, 'Senior'), (5, 'Expert'))
    os.makedirs(output_path, exist_ok=True)
    output_file = os.path.join(output_path, 'index.html')
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(template.render(data=data, levels=levels, language=language, static_path=static_path))


if __name__ == '__main__':
    for lang in LANGUAGES:
        generate_html_for_language(lang, os.path.join(OUTPUT_BASE, lang), STATIC_PATH_LANG)
        if lang == DEFAULT_LANGUAGE:
            generate_html_for_language(lang, OUTPUT_BASE, STATIC_PATH_DEFAULT)