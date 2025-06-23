apt install python3.12
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd model-app
rm -fr node_modules
npm install
npm run dev