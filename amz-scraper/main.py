from requests_tor import RequestsTor
rt = RequestsTor(tor_ports=(9150,), tor_cport=9151)
import time

def fetch_with_new_ip(url: str):
    # Force new identity
    rt.new_id()  
    time.sleep(3)  # required because Tor needs time to build the new circuit
    r = rt.get(url)
    return r.text

def get_product_data():
  print('Getting product data')
  

if __name__ == "__main__":
    for i in range(3):
        html = fetch_with_new_ip("https://www.amazon.com/Amazon-Essentials-Womens-Slim-Fit-XX-Large/dp/B07756L5GJ/ref=sr_1_2_ffob_sspa?_encoding=UTF8&content-id=amzn1.sym.1cb3993a-41fc-4a2a-b2ee-016e70298d9f&crid=19AKO4YZK6ZPJ&dib=eyJ2IjoiMSJ9.st_l-RrolkK_Qm_zyMf-vEsijxa32H0KANGEQNhcrsU9R_FKXG33I4NbPA7aWpRRgdZY_6uOsWQNZjtWL0fu0vTNA0xYOTeuj2Ze8zRVTqM4_BzPLy5DSyUh8fNh-XfAJY24iEJdOrQOXvIaEKU9CVzM1d6khtqG3DbYsJD9OjeHP-RR5cmXS4m4PpGKnf4kZj8EnqYR7bT1XGSJatH1MuoHW29ZAIZ02rZFbDFe3Nkf3DNfqZEV9UxO_CTXwryfc9v-jqThkJMg1v4cbhRjGiQNiI5r2R5afpbkMr8ET94.sXT8JADFrbK67TTETybMzskxkY20m_LkRv15v-BLAVI&dib_tag=se&keywords=Tops&pd_rd_r=1af9a611-52c6-413b-be66-6a6f3f7f3c2b&pd_rd_w=rtGEe&pd_rd_wg=NXBM2&qid=1759247225&refinements=p_36%3A-2500&rnid=2661611011&sprefix=tops%2Caps%2C250&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1")
        if "Amazon Essentials Women's Slim-Fit Tank Top, Pack of 2" in html:
            print("found Amazon Essentials Women's Slim-Fit Tank Top, Pack of 2")
        # print(f"IP #{i+1}: {html[:100].strip()}...") # Print only first 100 chars for brevity
