import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class TranslatedText {
    @Prop({ default: '' })
    en: string;

    @Prop({ default: '' })
    nl: string;

    @Prop({ default: '' })
    ta: string;
}

export const TranslatedTextSchema = SchemaFactory.createForClass(TranslatedText);
