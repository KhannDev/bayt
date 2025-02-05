import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import {
  CreatePartnerDto,
  UpdatePartnerDto,
  UploadDocsDto,
} from './dto/partner.dto';
import { AwsS3Service } from 'src/utils/aws/aws.service';
import { CustomerAuthGuard } from 'src/common/useguards/customer.useguard';
import { ApiOperation } from '@nestjs/swagger';
import { CustomRequest } from 'src/common/interfaces/interface';
import { Partner } from './schema/partner.schema';

@Controller('partners')
export class PartnerController {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly awsService: AwsS3Service,
  ) {}

  @Post()
  async createPartner(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnerService.create(createPartnerDto);
  }

  @Post('update')
  async updatePartner(
    @Body() updatePartnerDto: { email: string; update: any },
  ) {
    return this.partnerService.findByEmailAndUpdate(
      updatePartnerDto.email,
      updatePartnerDto.update,
    );
  }

  @Get()
  async getAllPartners(page?: number) {
    return this.partnerService.getAllPartners();
  }

  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Get currently logged-in customer' })
  @Get('/me')
  async getPartnerData(@Req() req: CustomRequest): Promise<Partner> {
    try {
      const partner = req.partner as Partner; // Access the user from the request

      if (!req.partner) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      return partner;
    } catch (e) {
      throw new HttpException('UnAuthorized ', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    try {
      // Use `await` on the query with populate, then call `.exec()` to execute the query
      const category = await this.partnerService.findById(id);

      return category;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('uploadDocs')
  async updateDocs(@Body() uploadDocsDto: UploadDocsDto) {
    const { fileName, fileExtension, name } = uploadDocsDto;
    const signedUrl = await this.awsService.getSignedUrl(
      name + '-' + fileName,
      fileExtension,
    );
    return { signedUrl };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    return this.partnerService.update(id, updateCustomerDto);
  }
}
