import json
import os
import re


def find_uuids(file_path):
    """Tìm tất cả UUID trong file"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
            
        # Mẫu regex cho UUID: 8-4-4-4-12 hex digits
        uuid_pattern = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        uuids = re.findall(uuid_pattern, content, re.IGNORECASE)
        return uuids
    except Exception as e:
        return f"Error reading file: {e}"

def find_original_filename(meta_file_path, target_uuid):
    """Tìm tên file gốc từ file metadata bằng UUID"""
    try:
        if os.path.exists(meta_file_path):
            with open(meta_file_path, 'r', encoding='utf-8') as file:
                metadata = json.load(file)
                
            # Tìm tên file gốc dựa vào UUID
            if isinstance(metadata, dict):
                for key, value in metadata.items():
                    if target_uuid == value:
                        # Trả về đường dẫn file mà không có đuôi .meta
                        if meta_file_path.endswith('.meta'):
                            return meta_file_path[:-5]  # Bỏ 5 ký tự cuối (".meta")
                        return meta_file_path
                        
            return None
        else:
            return None
    except Exception:
        return None

# File cần kiểm tra
file_path = "./load-game.txt"

# Tạo tên file đầu ra từ file đầu vào
input_filename = os.path.basename(file_path)
output_filename = os.path.splitext(input_filename)[0] + "-scaned" + os.path.splitext(input_filename)[1]

# Tìm UUIDs trong nội dung file
found_uuids = find_uuids(file_path)

# Mở file output để ghi kết quả
with open(output_filename, 'w', encoding='utf-8') as output_file:
    if isinstance(found_uuids, str):
        output_file.write(f"Error: {found_uuids}\n")
        print(f"Error: {found_uuids}")
    else:
        # Lấy danh sách UUID không trùng lặp
        unique_uuids = list(set(found_uuids))
        
        # Tìm các file metadata trong nhiều thư mục
        meta_dirs = ["src/assets", "src/extensions/shared-components/assets"]
        meta_files = []
        
        for meta_dir in meta_dirs:
            if os.path.exists(meta_dir) and os.path.isdir(meta_dir):
                for root, dirs, files in os.walk(meta_dir):
                    for file in files:
                        if file.endswith('.meta'):
                            meta_files.append(os.path.join(root, file))
        
        # Lưu trữ kết quả tìm thấy
        found_results = {}
        
        # Kiểm tra từng UUID trong file metadata
        for uuid in unique_uuids:
            for meta_file in meta_files:
                original_file = find_original_filename(meta_file, uuid)
                if original_file:
                    found_results[uuid] = original_file
                    break
        
        # Ghi kết quả vào file đầu ra
        if found_results:
            output_file.write("UUID -> Original filename\n")
            output_file.write("-" * 50 + "\n")
            
            # Sắp xếp kết quả theo đuôi file
            sorted_results = sorted(found_results.items(), key=lambda x: os.path.splitext(x[1])[1])
            
            for uuid, filename in sorted_results:
                output_file.write(f"{uuid} -> {filename}\n")
            
            print(f"Result in file: {output_filename}")
        else:
            output_file.write("No matching original files found for any UUID\n")
            print(f"No matching original files found for any UUID. Result in file: {output_filename}") 