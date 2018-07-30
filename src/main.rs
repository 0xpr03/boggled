use std::fs::File;
use std::io::{self,BufRead, BufReader,BufWriter, Write};

const DICTS: &'static [&'static str] = &["spell.txt", "american-english","british-english"];

fn main() -> std::io::Result<()> {
    let result_file = File::create("result.js")?;
    let source_file = File::open("src.js")?;
    
    let mut writer = BufWriter::new(result_file);
    let mut br = BufReader::new(source_file);
    io::copy(&mut br, &mut writer)?;
    
    let mut first_entry = true;
    let mut passed_copyright = false;
    writeln!(&mut writer, "\n// dicts copyright bei their owners")?;
    writeln!(&mut writer, "var Dictionary = new Set([")?;
    
    for dict in DICTS {
        println!("Adding dict {}",dict);
        add_dict(dict, &mut writer, &mut first_entry, &mut passed_copyright)?;
    }
    
    write!(&mut writer, "]);")?;
    writer.flush()?;
    assert!(passed_copyright == true,"no copyright passed!");
    assert!(first_entry == false,"first entry not passed!");
    Ok(())
}

fn add_dict<W: Write>(path: &str, writer: &mut BufWriter<W>, first_entry: &mut bool, passed_copyright: &mut bool) -> std::io::Result<()> {
    let dict_file = File::open(path)?;
    let br = BufReader::new(dict_file);
    let mut total: u64 = 0;
    let mut removed: u64 = 0;
    for line_ in br.lines() {
        let line = line_?;
        // don't add "word's"
        if line.contains("'") {
            removed += 1;
            continue;
        }
        if *passed_copyright {
            total += 1;
            if *first_entry  {
                write!(writer, "\"{}\"",line)?;
                *first_entry = false;
            } else {
                write!(writer, ",\"{}\"",line)?;
            }
        } else {
            *passed_copyright = line == "---";
        }
    }
    println!("Used {}/{} Entries",total-removed,total);
    Ok(())
}
